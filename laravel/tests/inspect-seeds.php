<?php

// Inspección de datos, sin escrituras ni salida de contraseñas/hashes.
use Database\Seeders\SeedData;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Tests\Support\SeedControlQueries;

require __DIR__.'/../vendor/autoload.php';
$testing = in_array('--testing', $argv, true);
$app = require __DIR__.'/../bootstrap/app.php';
$app->loadEnvironmentFrom($testing ? '.env.testing' : '.env');
$app->make(Kernel::class)->bootstrap();
$identity = DB::selectOne('SELECT DATABASE() AS db, CURRENT_USER() AS account');
$expected = $testing ? 'crm_ferreteria_test' : 'crm_ferreteria';
if ($identity->db !== $expected) {
    throw new RuntimeException('La base efectiva no coincide con la solicitada.');
}
$counts = [];
foreach (SeedData::TABLES as $table) {
    $counts[$table] = DB::table($table)->count();
}
echo json_encode([
    'connection' => $identity,
    'counts' => $counts,
    'controls_common' => SeedControlQueries::controls(),
    'products_october' => SeedControlQueries::productSales(),
    'company_including_sector_october' => SeedControlQueries::summary(DB::table('users')->pluck('email')->all(), '2026-10'),
    'historical_price' => DB::table('oportunidad_productos as l')
        ->join('oportunidades as o', 'o.id', '=', 'l.oportunidad_id')
        ->join('productos as p', 'p.id', '=', 'l.producto_id')
        ->where('o.titulo', 'Renovación de planes')->where('p.nombre', 'Plan avanzado')
        ->first(['p.precio as catalogo', 'l.precio_unitario as cotizado']),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR).PHP_EOL;
