<?php

// Solo para el servidor local lanzado por la prueba integral; no es una ruta de la aplicación.
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

$public = realpath(__DIR__.'/../../public');
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '');
$asset = realpath($public.$uri);
if ($uri !== '/' && $asset && str_starts_with($asset, $public.DIRECTORY_SEPARATOR) && is_file($asset)) {
    return false;
}
require __DIR__.'/../../vendor/autoload.php';
$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
$sessionDirectory = realpath(getenv('CRM_REVIEW_SESSIONS') ?: '');
if (! $sessionDirectory || basename($sessionDirectory) !== 'laravel-sessions'
    || ! str_starts_with($sessionDirectory, sys_get_temp_dir().DIRECTORY_SEPARATOR.'crm-integral-browser-')) {
    http_response_code(503);
    exit('Sesiones de revisión fuera de alcance.');
}
config(['session.files' => $sessionDirectory]);
$identity = DB::selectOne('SELECT DATABASE() AS db, CURRENT_USER() AS account, @@port AS port');
if ($identity->db !== 'crm_ferreteria_test' || $identity->account !== 'crm_laravel_test@127.0.0.1' || (int) $identity->port !== 3306) {
    http_response_code(503);
    exit('Destino de revisión incorrecto.');
}
header('X-Review-Database: '.$identity->db.';'.$identity->account.';'.$identity->port);
$app->handleRequest(Request::capture());
