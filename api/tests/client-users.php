<?php

// Cuentas aisladas para A3, creadas/hash por Laravel, nunca por el servidor Node.
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../../laravel/vendor/autoload.php';
putenv('APP_ENV=testing');
$app = require __DIR__.'/../../laravel/bootstrap/app.php';
$app->loadEnvironmentFrom('.env.testing');
$app->make(Kernel::class)->bootstrap();
$id = DB::selectOne('SELECT DATABASE() AS db, CURRENT_USER() AS account');
if ($id->db !== 'crm_ferreteria_test' || $id->account !== 'crm_laravel_test@127.0.0.1') {
    throw new RuntimeException('Base de fixtures incorrecta.');
}
$input = json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR);
$run = $input['run'] ?? '';
if (! preg_match('/\A[a-f0-9]{24}\z/', $run)) {
    throw new RuntimeException('Identificador de fixtures incorrecto.');
}
$names = ['supervisor', 'admin', ...array_map(fn ($n) => 'seller'.$n, range(0, 9))];
$email = fn ($name) => 'a3-'.$run.'-'.$name.'@concurrency.test';
if ($input['action'] === 'create') {
    $result = DB::transaction(function () use ($input, $names, $email) {
        $users = [];
        foreach ($names as $name) {
            $seller = str_starts_with($name, 'seller');
            $users[$name] = User::create([
                'name' => 'Temporal A3 '.$name, 'email' => $email($name), 'password' => $input['password'],
                'rol' => $seller ? 'vendedor' : ($name === 'admin' ? 'administrador' : 'supervisor'),
                'supervisor_id' => $seller ? $users['supervisor']->id : null, 'activo' => true,
            ]);
        }

        return array_map(fn ($user) => $user->only('id', 'name', 'email'), $users);
    });
    echo json_encode($result, JSON_THROW_ON_ERROR);
} elseif ($input['action'] === 'cleanup') {
    foreach (array_reverse($names) as $name) {
        User::where('email', $email($name))->delete();
    }
    echo json_encode(['ok' => true]);
} else {
    throw new RuntimeException('Acción no permitida.');
}
