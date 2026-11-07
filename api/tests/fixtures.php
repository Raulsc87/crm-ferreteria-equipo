<?php

// Solo prepara cuentas temporales mediante Laravel; no es una ruta ni genera hashes en Node.
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../../laravel/vendor/autoload.php';
putenv('APP_ENV=testing');
$app = require __DIR__.'/../../laravel/bootstrap/app.php';
$app->loadEnvironmentFrom('.env.testing');
$app->make(Kernel::class)->bootstrap();
$identity = DB::selectOne('SELECT DATABASE() AS db, CURRENT_USER() AS account');
if ($identity->db !== 'crm_ferreteria_test' || $identity->account !== 'crm_laravel_test@127.0.0.1') {
    throw new RuntimeException('Los fixtures requieren la base y cuenta Laravel de pruebas.');
}
$input = json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR);
$run = $input['run'] ?? '';
if (! preg_match('/\A[a-f0-9]{24}\z/', $run)) {
    throw new RuntimeException('Identificador de fixtures inválido.');
}
$email = fn ($name) => $name.'-'.$run.'@api-test.invalid';
$action = $input['action'] ?? '';
if ($action === 'create') {
    $users = DB::transaction(function () use ($input, $email) {
        $supervisor = User::create(['name' => 'Supervisor temporal API', 'email' => $email('supervisor'), 'rol' => 'supervisor', 'activo' => true, 'password' => $input['password']]);
        $result = ['supervisor' => $supervisor];
        foreach (['admin', 'seller', 'inactive', 'removable'] as $name) {
            $seller = $name !== 'admin';
            $result[$name] = User::create([
                'name' => 'Temporal API '.$name, 'email' => $email($name),
                'rol' => $seller ? 'vendedor' : 'administrador', 'supervisor_id' => $seller ? $supervisor->id : null,
                'activo' => $name !== 'inactive', 'password' => $input['password'],
            ]);
        }

        return array_map(fn ($user) => ['id' => $user->id, 'nombre' => $user->name, 'correo' => $user->email, 'bcrypt_laravel' => str_starts_with($user->password, '$2y$')], $result);
    });
    echo json_encode(['identity' => $identity, 'users' => $users], JSON_THROW_ON_ERROR);
} elseif (in_array($action, ['inactive', 'active', 'role', 'remove'], true)) {
    $name = $action === 'remove' ? 'removable' : 'seller';
    $user = User::where('email', $email($name))->firstOrFail();
    if ($action === 'remove') {
        $user->delete();
    } else {
        $data = match ($action) {
            'inactive' => ['activo' => false], 'active' => ['activo' => true],
            'role' => ['rol' => 'supervisor', 'supervisor_id' => null],
        };
        $user->update($data);
    }
    echo json_encode(['ok' => true]);
} elseif ($action === 'cleanup') {
    // Solo estas cinco identidades aleatorias; nunca vaciar tablas ni tocar la semilla manual.
    foreach (['removable', 'inactive', 'seller', 'admin', 'supervisor'] as $name) {
        User::where('email', $email($name))->delete();
    }
    echo json_encode(['ok' => true]);
} else {
    throw new RuntimeException('Acción de fixtures no permitida.');
}
