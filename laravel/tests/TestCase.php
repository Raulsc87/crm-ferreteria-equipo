<?php

namespace Tests;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = parent::createApplication();

        // Se comprueba antes de iniciar traits que pudieran escribir en la base.
        if (! $app->environment('testing') || ! is_file($app->environmentPath().'/.env.testing')) {
            throw new \RuntimeException('Las pruebas requieren .env.testing local.');
        }

        $db = $app->make('db')->connection();
        if ($db->getDriverName() !== 'mysql'
            || $db->selectOne('SELECT DATABASE() AS selected_database')->selected_database !== 'crm_ferreteria_test') {
            throw new \RuntimeException('Prueba detenida: la base seleccionada no es crm_ferreteria_test.');
        }

        foreach ([RefreshDatabase::class,
            DatabaseMigrations::class,
            DatabaseTruncation::class] as $trait) {
            if (isset($this->traitsUsedByTest[$trait])) {
                throw new \RuntimeException('No se autorizan traits que reinician o vacían la base. Use transacciones.');
            }
        }

        return $app;
    }
}
