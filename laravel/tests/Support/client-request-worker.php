<?php

// Ejecutor CLI exclusivo de pruebas: HTTP del kernel, sin servidor/API nuevos.
use App\Models\User;
use Illuminate\Contracts\Console\Kernel as ConsoleKernel;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../../vendor/autoload.php';
ini_set('display_errors', '0');
try {
    foreach (['APP_ENV' => 'testing', 'APP_DEBUG' => 'false', 'SESSION_DRIVER' => 'array', 'CACHE_STORE' => 'array'] as $key => $value) {
        putenv($key.'='.$value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
    $input = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
    $directory = realpath($input['barrier']);
    if (! $directory || ! str_starts_with(strtolower($directory), strtolower(sys_get_temp_dir().DIRECTORY_SEPARATOR.'crm-l4-'))
        || ! in_array($input['worker'], [0, 1], true)) {
        throw new RuntimeException('INVALID_BARRIER');
    }
    $app = require __DIR__.'/../../bootstrap/app.php';
    $app->loadEnvironmentFrom('.env.testing');
    $app->make(ConsoleKernel::class)->bootstrap();
    $db = DB::connection();
    $identity = $db->selectOne('SELECT DATABASE() AS db, CURRENT_USER() AS account, CONNECTION_ID() AS connection_id');
    if ($identity->db !== 'crm_ferreteria_test' || $identity->account !== 'crm_laravel_test@127.0.0.1') {
        throw new RuntimeException('WRONG_DATABASE');
    }
    $actor = User::findOrFail($input['actor']);
    if (! str_ends_with($actor->email, '@concurrency.test')) {
        throw new RuntimeException('WRONG_ACTOR');
    }
    $marker = fn ($name) => $directory.DIRECTORY_SEPARATOR.$input['worker'].'-'.$name;
    $db->beforeExecuting(function ($sql) use ($marker) {
        if (str_contains(strtolower($sql), 'users') && str_contains(strtolower($sql), 'for update')) {
            file_put_contents($marker('waiting'), (string) microtime(true));
        }
    });
    file_put_contents($marker('ready'), 'ready');
    $deadline = microtime(true) + 45;
    while (! is_file($directory.DIRECTORY_SEPARATOR.'go')) {
        if (microtime(true) > $deadline) {
            throw new RuntimeException('BARRIER_TIMEOUT');
        }
        usleep(10000);
    }
    Auth::guard('web')->setUser($actor);
    $request = Request::create($input['path'], $input['method'], $input['data']);
    $request->headers->set('Accept', 'application/json');
    $start = microtime(true);
    $kernel = $app->make(Kernel::class);
    $response = $kernel->handle($request);
    $finish = microtime(true);
    $body = json_decode($response->getContent(), true);
    $kernel->terminate($request, $response);
    echo json_encode(['status' => $response->getStatusCode(), 'errors' => $body['errors'] ?? [],
        'connection' => $identity->connection_id, 'start' => $start, 'finish' => $finish], JSON_THROW_ON_ERROR);
} catch (Throwable $exception) {
    echo json_encode(['failed' => true, 'class' => get_class($exception), 'code' => (string) $exception->getCode()]);
    exit(1);
}
