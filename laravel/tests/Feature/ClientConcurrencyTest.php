<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use Database\Seeders\SeedData;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class ClientConcurrencyTest extends TestCase
{
    private string $prefix;

    private array $users = [];

    private array $processes = [];

    private ?string $directory = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertIsolated();
        SeedData::requireEmptyBusinessTables();
        $this->prefix = 'l4-'.bin2hex(random_bytes(6)).'-';
        $this->users['adminA'] = $this->account('adminA', 'administrador');
        $this->users['adminB'] = $this->account('adminB', 'administrador');
        $this->users['supervisor'] = $this->account('supervisor', 'supervisor');
        $this->users['sellerA'] = $this->account('sellerA', 'vendedor', $this->users['supervisor']->id);
        $this->users['sellerB'] = $this->account('sellerB', 'vendedor', $this->users['supervisor']->id);
    }

    public function test_two_simultaneous_creates_at_nine_clients_leave_exactly_ten(): void
    {
        $this->portfolio(9, $this->users['sellerA']->id);
        $results = $this->race([
            $this->request(0, 'POST', '/clientes', $this->data(1, ['vendedor_id' => $this->users['sellerA']->id])),
            $this->request(1, 'POST', '/clientes', $this->data(2, ['vendedor_id' => $this->users['sellerA']->id])),
        ], [$this->users['sellerA']->id]);
        $this->assertStatuses([302, 409], $results);
        $this->assertSame(10, Client::where('vendedor_id', $this->users['sellerA']->id)->count());
        $this->assertCount(1, array_filter($results, fn ($r) => isset($r['errors']['vendedor_id'])));
        $this->evidence('dos_altas_cupo_9', $results, ['cartera_final' => 10]);
    }

    public function test_simultaneous_assignments_of_same_available_client_have_one_winner(): void
    {
        $pool = Client::create($this->data(1));
        $results = $this->race([
            $this->request(0, 'PATCH', '/clientes/'.$pool->id.'/asignacion', $this->action($this->users['sellerA']->id)),
            $this->request(1, 'PATCH', '/clientes/'.$pool->id.'/asignacion', $this->action($this->users['sellerB']->id)),
        ], [$this->users['sellerA']->id, $this->users['sellerB']->id]);
        $this->assertStatuses([302, 409], $results);
        $this->assertContains($pool->fresh()->vendedor_id, [$this->users['sellerA']->id, $this->users['sellerB']->id]);
        $this->assertSame(1, Client::whereNotNull('vendedor_id')->count());
        $this->evidence('mismo_disponible', $results, ['ganadores' => 1]);
    }

    public function test_simultaneous_reassignments_to_nine_clients_leave_exactly_ten(): void
    {
        $this->portfolio(9, $this->users['sellerA']->id);
        $left = Client::create($this->data(10, ['vendedor_id' => $this->users['sellerB']->id]));
        $right = Client::create($this->data(11, ['vendedor_id' => $this->users['sellerB']->id]));
        $action = $this->action($this->users['sellerA']->id, $this->users['sellerB']->id);
        $results = $this->race([
            $this->request(0, 'PATCH', '/clientes/'.$left->id.'/asignacion', $action),
            $this->request(1, 'PATCH', '/clientes/'.$right->id.'/asignacion', $action),
        ], [$this->users['sellerA']->id, $this->users['sellerB']->id]);
        $this->assertStatuses([302, 409], $results);
        $this->assertSame(10, Client::where('vendedor_id', $this->users['sellerA']->id)->count());
        $this->assertSame(1, Client::where('vendedor_id', $this->users['sellerB']->id)->count());
        $this->evidence('dos_reasignaciones_cupo_9', $results, ['cartera_destino' => 10, 'cartera_origen' => 1]);
    }

    public function test_simultaneous_normalized_nit_duplicates_are_stopped_by_unique_index(): void
    {
        $results = $this->race([
            $this->request(0, 'POST', '/clientes', $this->data(1, ['nit' => '8100012', 'vendedor_id' => $this->users['sellerA']->id])),
            $this->request(1, 'POST', '/clientes', $this->data(2, ['nit' => '000 810001-2', 'vendedor_id' => $this->users['sellerA']->id])),
        ], [$this->users['sellerA']->id]);
        $this->assertStatuses([302, 409], $results);
        $this->assertSame(1, Client::where('nit', '8100012')->count());
        $this->assertCount(1, array_filter($results, fn ($r) => isset($r['errors']['nit'])));
        $this->evidence('nit_duplicado_normalizado', $results, ['filas_finales' => 1]);
    }

    public function test_simultaneous_normalized_phone_duplicates_are_stopped_by_unique_index(): void
    {
        $results = $this->race([
            $this->request(0, 'POST', '/clientes', $this->data(1, ['telefono' => '59000777', 'vendedor_id' => $this->users['sellerA']->id])),
            $this->request(1, 'POST', '/clientes', $this->data(2, ['telefono' => '+502 (5900)-0777', 'vendedor_id' => $this->users['sellerA']->id])),
        ], [$this->users['sellerA']->id]);
        $this->assertStatuses([302, 409], $results);
        $this->assertSame(1, Client::where('telefono', '59000777')->count());
        $this->assertCount(1, array_filter($results, fn ($r) => isset($r['errors']['telefono'])));
        $this->evidence('telefono_duplicado_normalizado', $results, ['filas_finales' => 1]);
    }

    private function race(array $requests, array $gateIds): array
    {
        $this->directory = sys_get_temp_dir().DIRECTORY_SEPARATOR.'crm-l4-'.bin2hex(random_bytes(8));
        mkdir($this->directory);
        DB::beginTransaction();
        try {
            sort($gateIds, SORT_NUMERIC);
            User::whereIn('id', $gateIds)->orderBy('id')->lockForUpdate()->get();
            foreach ($requests as $i => $request) {
                $request['barrier'] = $this->directory;
                $request['worker'] = $i;
                $p = new Process([PHP_BINARY, __DIR__.'/../Support/client-request-worker.php'], base_path());
                $p->setTimeout(60)->setInput(json_encode($request, JSON_THROW_ON_ERROR));
                $p->start();
                $this->processes[] = $p;
            }
            $this->waitMarkers('ready');
            file_put_contents($this->directory.DIRECTORY_SEPARATOR.'go', 'go');
            $this->waitMarkers('waiting');
            usleep(200000);
            foreach ($this->processes as $process) {
                $this->assertTrue($process->isRunning(), 'La petición terminó antes de liberar la barrera SQL.');
            }
            $released = microtime(true);
            DB::commit();
            $results = [];
            foreach ($this->processes as $process) {
                $process->wait();
                $this->assertTrue($process->isSuccessful(), 'El ejecutor HTTP no terminó correctamente.');
                $result = json_decode($process->getOutput(), true, 512, JSON_THROW_ON_ERROR);
                $this->assertArrayNotHasKey('failed', $result);
                $this->assertLessThan($released, $result['start']);
                $this->assertGreaterThan($released, $result['finish']);
                $results[] = $result;
            }
            $this->assertNotSame($results[0]['connection'], $results[1]['connection']);

            return $results;
        } finally {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            foreach ($this->processes as $process) {
                if ($process->isRunning()) {
                    $process->stop(1);
                }
            }
        }
    }

    private function waitMarkers(string $suffix): void
    {
        $deadline = microtime(true) + 40;
        do {
            if (is_file($this->directory.DIRECTORY_SEPARATOR.'0-'.$suffix) && is_file($this->directory.DIRECTORY_SEPARATOR.'1-'.$suffix)) {
                return;
            }
            foreach ($this->processes as $process) {
                $process->checkTimeout();
                if (! $process->isRunning()) {
                    $this->fail('El ejecutor terminó antes de llegar a la barrera '.$suffix.'.');
                }
            }
            usleep(10000);
        } while (microtime(true) < $deadline);
        $this->fail('Los ejecutores no alcanzaron la barrera '.$suffix.'.');
    }

    private function request(int $worker, string $method, string $path, array $data): array
    {
        return ['actor' => $this->users[$worker === 0 ? 'adminA' : 'adminB']->id, 'method' => $method, 'path' => $path, 'data' => $data];
    }

    private function action(int $destination, ?int $expected = null): array
    {
        return ['confirmar' => '1', 'vendedor_id' => $destination, 'expected_vendedor_id' => $expected];
    }

    private function portfolio(int $count, int $seller): void
    {
        for ($i = 0; $i < $count; $i++) {
            Client::create($this->data(100 + $i, ['vendedor_id' => $seller]));
        }
    }

    private function data(int $i, array $changes = []): array
    {
        return array_replace(['nombre' => $this->prefix.'cliente-'.$i, 'nit' => null, 'telefono' => (string) (59001000 + $i), 'correo' => null], $changes);
    }

    private function account(string $label, string $role, ?int $supervisor = null): User
    {
        return User::create(['name' => $this->prefix.$label, 'email' => $this->prefix.$label.'@concurrency.test',
            'password' => bin2hex(random_bytes(16)), 'rol' => $role, 'supervisor_id' => $supervisor, 'activo' => true]);
    }

    private function assertStatuses(array $expected, array $results): void
    {
        $actual = array_column($results, 'status');
        sort($actual);
        $this->assertSame($expected, $actual);
    }

    private function evidence(string $scenario, array $results, array $state): void
    {
        fwrite(STDOUT, PHP_EOL.json_encode(['concurrencia' => $scenario, 'solapamiento_bajo_bloqueo' => true,
            'estados' => array_column($results, 'status'), 'conexiones_distintas' => true, 'final' => $state], JSON_UNESCAPED_UNICODE).PHP_EOL);
    }

    private function assertIsolated(): void
    {
        $db = DB::selectOne('SELECT DATABASE() AS db, CURRENT_USER() AS account');
        $this->assertSame('crm_ferreteria_test', $db->db);
        $this->assertSame('crm_laravel_test@127.0.0.1', $db->account);
        foreach (DB::select('SHOW GRANTS') as $row) {
            $grant = array_values((array) $row)[0];
            $this->assertFalse(str_contains($grant, 'WITH GRANT OPTION'));
            $this->assertTrue(str_starts_with($grant, 'GRANT USAGE ON *.*')
                || str_contains($grant, ' ON '.chr(96).'crm\\_ferreteria\\_test'.chr(96).'.* ')
                || str_contains($grant, ' ON '.chr(96).'crm_ferreteria_test'.chr(96).'.* '));
        }
    }

    protected function tearDown(): void
    {
        try {
            foreach ($this->processes as $process) {
                if ($process->isRunning()) {
                    $process->stop(1);
                }
            }
            if (isset($this->prefix)) {
                $clients = Client::where('nombre', 'like', $this->prefix.'%')->get();
                foreach ($clients as $client) {
                    $this->assertIsolated();
                    $client->delete();
                }
                foreach (array_reverse($this->users) as $user) {
                    $this->assertIsolated();
                    $this->assertTrue(str_starts_with($user->email, $this->prefix));
                    $user->delete();
                }
            }
            if ($this->directory) {
                foreach (glob($this->directory.DIRECTORY_SEPARATOR.'*') as $file) {
                    unlink($file);
                }
                rmdir($this->directory);
            }
        } finally {
            parent::tearDown();
        }
    }
}
