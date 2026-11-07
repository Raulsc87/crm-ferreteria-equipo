<?php

// Preparación explícita de la base aislada elegida para las cifras comunes de A6.
use Database\Seeders\SeedData;
use Database\Seeders\VerificacionSeeder;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

if (! is_file(__DIR__.'/../../laravel/.env.a6-testing')) {
    throw new RuntimeException('Falta el perfil local aislado A6; no se intenta ninguna conexión.');
}
require __DIR__.'/../../laravel/vendor/autoload.php';
putenv('APP_ENV=a6-testing');
$app = require __DIR__.'/../../laravel/bootstrap/app.php';
$app->loadEnvironmentFrom('.env.a6-testing');
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();
$identity = DB::selectOne('SELECT DATABASE() AS db, CURRENT_USER() AS account');
if ($identity->db !== 'crm_ferreteria_a6_test' || $identity->account !== 'crm_laravel_a6_test@127.0.0.1') {
    throw new RuntimeException('Perfil aislado A6 incorrecto.');
}
foreach (DB::select('SHOW GRANTS') as $row) {
    $grant = str_replace('\\_', '_', array_values((array) $row)[0]);
    if (! str_starts_with($grant, 'GRANT USAGE ON *.*') && ! str_contains($grant, ' ON `crm_ferreteria_a6_test`.* TO ')) {
        throw new RuntimeException('Cuenta A6 no limitada a su base.');
    }
}
if (($argv[1] ?? '') === '--prepare') {
    if ($kernel->call('migrate', ['--no-interaction' => true]) !== 0) {
        throw new RuntimeException('Migraciones A6 no aplicadas.');
    }
    $empty = collect(SeedData::TABLES)->every(fn ($table) => DB::table($table)->count() === 0);
    if ($empty) {
        $app->make(VerificacionSeeder::class)->run();
    }
}
$counts = [];
foreach (SeedData::TABLES as $table) {
    $counts[$table] = DB::table($table)->count();
}
if (array_values($counts) !== [7, 5, 21, 11, 13, 43, 4]) {
    throw new RuntimeException('La base A6 no contiene únicamente la semilla común esperada; no se borra ni reinicia.');
}
echo json_encode(['database' => $identity->db, 'account' => $identity->account, 'counts' => $counts], JSON_THROW_ON_ERROR);
