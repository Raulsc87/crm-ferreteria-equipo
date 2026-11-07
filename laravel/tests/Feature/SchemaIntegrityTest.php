<?php

namespace Tests\Feature;

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SchemaIntegrityTest extends TestCase
{
    use DatabaseTransactions;

    private array $rows;

    private array $ids;

    protected function setUp(): void
    {
        parent::setUp(); // TestCase valida DATABASE() antes de DatabaseTransactions.
        $suffix = bin2hex(random_bytes(6));
        $supervisor = DB::table('users')->insertGetId([
            'name' => 'Supervisor temporal', 'email' => "supervisor-{$suffix}@example.test",
            'password' => Hash::make(bin2hex(random_bytes(16))), 'rol' => 'supervisor',
        ]);
        $this->rows['users'] = [
            'name' => 'Vendedor temporal', 'email' => "vendedor-{$suffix}@example.test",
            'password' => Hash::make(bin2hex(random_bytes(16))), 'supervisor_id' => $supervisor,
        ];
        $this->ids['users'] = DB::table('users')->insertGetId($this->rows['users']);
        $phone = $this->unusedPhone();
        $this->rows['productos'] = ['nombre' => "Producto temporal {$suffix}", 'precio' => '12.50'];
        $this->ids['productos'] = DB::table('productos')->insertGetId($this->rows['productos']);
        $this->rows['clientes'] = [
            'nombre' => 'Cliente temporal', 'vendedor_id' => $this->ids['users'],
            'nit' => null, 'telefono' => $phone,
        ];
        $this->ids['clientes'] = DB::table('clientes')->insertGetId($this->rows['clientes']);
        $this->rows['oportunidades'] = [
            'cliente_id' => $this->ids['clientes'], 'vendedor_id' => $this->ids['users'],
            'titulo' => 'Oportunidad temporal',
        ];
        $this->ids['oportunidades'] = DB::table('oportunidades')->insertGetId($this->rows['oportunidades']);
        $this->rows['oportunidad_productos'] = [
            'oportunidad_id' => $this->ids['oportunidades'], 'producto_id' => $this->ids['productos'],
            'cantidad' => 1, 'precio_unitario' => '12.50',
        ];
    }

    #[DataProvider('invalidRows')]
    public function test_database_rejects_invalid_rows(string $table, array $changes, int $code): void
    {
        $row = array_replace($this->rows[$table], $changes);
        // Evitar que un UNIQUE oculte el CHECK que se pretende verificar.
        if ($table === 'productos' && ! array_key_exists('nombre', $changes)) {
            $row['nombre'] .= ' otro';
        }
        if ($table === 'users' && ! array_key_exists('email', $changes)) {
            $row['email'] = 'otro-'.$row['email'];
        }
        try {
            DB::table($table)->insert($row);
            $this->fail('MySQL aceptó una fila inválida.');
        } catch (QueryException $exception) {
            $this->assertSame($code, (int) $exception->errorInfo[1]);
        }
    }

    public static function invalidRows(): array
    {
        $cases = [
            'precio producto cero' => ['productos', ['precio' => '0.00'], 3819],
            'precio producto negativo' => ['productos', ['precio' => '-0.01'], 3819],
            'minimo cero' => ['productos', ['cantidad_minima' => 0], 3819],
            'minimo mayor 999' => ['productos', ['cantidad_minima' => 1000], 3819],
            'precio linea cero' => ['oportunidad_productos', ['precio_unitario' => '0.00'], 3819],
            'precio linea negativo' => ['oportunidad_productos', ['precio_unitario' => '-1.00'], 3819],
            'cantidad cero' => ['oportunidad_productos', ['cantidad' => 0], 3819],
            'cantidad negativa' => ['oportunidad_productos', ['cantidad' => -1], 3819],
            'cantidad mayor 999' => ['oportunidad_productos', ['cantidad' => 1000], 3819],
            'telefono inicial 1' => ['clientes', ['telefono' => '12345678'], 3819],
            'telefono inicial 0' => ['clientes', ['telefono' => '02345678'], 3819],
            'telefono corto' => ['clientes', ['telefono' => '2345678'], 3819],
            'telefono letras' => ['clientes', ['telefono' => '2345678A'], 3819],
            'telefono nulo' => ['clientes', ['telefono' => null], 1048],
            'vendedor sin supervisor' => ['users', ['supervisor_id' => null], 3819],
            'administrador con supervisor' => ['users', ['rol' => 'administrador'], 3819],
            'supervisor con supervisor' => ['users', ['rol' => 'supervisor'], 3819],
            'cliente con vendedor inexistente' => ['clientes', ['vendedor_id' => 1844674407370955161, 'telefono' => '22223333'], 1452],
            'linea con producto inexistente' => ['oportunidad_productos', ['producto_id' => 1844674407370955161], 1452],
            'ganada sin cierre' => ['oportunidades', ['etapa' => 'ganada'], 3819],
            'ganada con motivo' => ['oportunidades', ['etapa' => 'ganada', 'fecha_cierre' => '2026-11-01 12:00:00', 'motivo_perdida' => 'No aplica'], 3819],
            'perdida sin motivo' => ['oportunidades', ['etapa' => 'perdida', 'fecha_cierre' => '2026-11-01 12:00:00'], 3819],
            'perdida motivo vacio' => ['oportunidades', ['etapa' => 'perdida', 'fecha_cierre' => '2026-11-01 12:00:00', 'motivo_perdida' => ''], 3819],
            'perdida motivo espacios' => ['oportunidades', ['etapa' => 'perdida', 'fecha_cierre' => '2026-11-01 12:00:00', 'motivo_perdida' => '   '], 3819],
            'perdida sin cierre' => ['oportunidades', ['etapa' => 'perdida', 'motivo_perdida' => 'Sin presupuesto'], 3819],
        ];
        foreach (['prospecto', 'calificado', 'propuesta', 'negociacion'] as $stage) {
            $cases["{$stage} con cierre"] = ['oportunidades', ['etapa' => $stage, 'fecha_cierre' => '2026-11-01 12:00:00'], 3819];
            $cases["{$stage} con motivo"] = ['oportunidades', ['etapa' => $stage, 'motivo_perdida' => 'No aplica'], 3819];
        }

        return $cases;
    }

    #[DataProvider('uniqueKeys')]
    public function test_unique_keys_reject_duplicates(string $table): void
    {
        if ($table === 'oportunidad_productos') {
            DB::table($table)->insert($this->rows[$table]);
        }
        try {
            DB::table($table)->insert($this->rows[$table]);
            $this->fail('MySQL aceptó un duplicado.');
        } catch (QueryException $exception) {
            $this->assertSame(1062, (int) $exception->errorInfo[1]);
        }
    }

    public static function uniqueKeys(): array
    {
        return [['users'], ['productos'], ['clientes'], ['oportunidad_productos']];
    }

    public function test_nit_is_unique_and_multiple_null_values_are_allowed(): void
    {
        do {
            $nit = (string) random_int(10000000, 99999999);
        } while (DB::table('clientes')->where('nit', $nit)->exists());
        DB::table('clientes')->where('id', $this->ids['clientes'])->update(['nit' => $nit]);
        $row = $this->rows['clientes'];
        $row['telefono'] = $this->unusedPhone();
        $second = DB::table('clientes')->insertGetId($row);
        $row['telefono'] = $this->unusedPhone();
        $third = DB::table('clientes')->insertGetId($row);
        $this->assertSame(2, DB::table('clientes')->whereIn('id', [$second, $third])->whereNull('nit')->count());
        try {
            DB::table('clientes')->where('id', $second)->update(['nit' => $nit]);
            $this->fail('MySQL aceptó un NIT repetido.');
        } catch (QueryException $exception) {
            $this->assertSame(1062, (int) $exception->errorInfo[1]);
        }
    }

    public function test_valid_limits_defaults_and_closure_states(): void
    {
        $product = DB::table('productos')->find($this->ids['productos']);
        $this->assertSame(1, $product->cantidad_minima);
        $this->assertSame(1, $product->activo);
        $user = DB::table('users')->find($this->ids['users']);
        $this->assertSame('vendedor', $user->rol);
        $this->assertSame(1, $user->activo);
        $opportunity = DB::table('oportunidades')->find($this->ids['oportunidades']);
        $this->assertSame('prospecto', $opportunity->etapa);
        $this->assertNull($opportunity->fecha_cierre);
        $this->assertNull($opportunity->motivo_perdida);

        DB::table('oportunidad_productos')->insert($this->rows['oportunidad_productos']);
        foreach ([1, 999] as $limit) {
            DB::table('productos')->where('id', $product->id)->update(['cantidad_minima' => $limit, 'precio' => '0.01']);
            DB::table('oportunidad_productos')->where('oportunidad_id', $opportunity->id)->update(['cantidad' => $limit, 'precio_unitario' => '0.01']);
        }
        $this->assertSame(999, DB::table('oportunidad_productos')->where('oportunidad_id', $opportunity->id)->value('cantidad'));
        foreach (['prospecto', 'calificado', 'propuesta', 'negociacion', 'ganada', 'perdida'] as $stage) {
            $row = $this->rows['oportunidades'] + [
                'etapa' => $stage,
                'fecha_cierre' => in_array($stage, ['ganada', 'perdida']) ? '2026-11-01 12:00:00' : null,
                'motivo_perdida' => $stage === 'perdida' ? 'Sin presupuesto' : null,
            ];
            $id = DB::table('oportunidades')->insertGetId($row);
            $this->assertSame($stage, DB::table('oportunidades')->where('id', $id)->value('etapa'));
        }
        $this->assertSame('+00:00', DB::selectOne('SELECT @@session.time_zone AS zone')->zone);
    }

    public function test_history_activity_defaults_and_declared_delete_rules(): void
    {
        DB::table('oportunidad_productos')->insert($this->rows['oportunidad_productos']);
        $history = DB::table('historial_etapas')->insertGetId([
            'oportunidad_id' => $this->ids['oportunidades'], 'usuario_id' => $this->ids['users'],
            'etapa_anterior' => null, 'etapa_nueva' => 'prospecto', 'created_at' => '2026-11-01 12:00:00',
        ]);
        $activity = DB::table('actividades')->insertGetId([
            'cliente_id' => $this->ids['clientes'], 'vendedor_id' => $this->ids['users'],
            'tipo' => 'tarea', 'descripcion' => 'Temporal',
        ]);
        $this->assertSame(0, DB::table('actividades')->where('id', $activity)->value('completada'));
        $this->assertNull(DB::table('actividades')->where('id', $activity)->value('vence_en'));
        $this->assertNull(DB::table('historial_etapas')->where('id', $history)->value('etapa_anterior'));
        // Comprobar las reglas instaladas sin ejecutar DELETE, por alcance autorizado.
        $rules = collect(DB::select('SELECT CONSTRAINT_NAME, DELETE_RULE FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE()'))
            ->pluck('DELETE_RULE', 'CONSTRAINT_NAME');
        foreach (['oportunidad_productos_oportunidad_id_foreign', 'historial_etapas_oportunidad_id_foreign', 'actividades_cliente_id_foreign'] as $constraint) {
            $this->assertSame('CASCADE', $rules[$constraint]);
        }
        $this->assertContains($rules['oportunidades_cliente_id_foreign'], ['RESTRICT', 'NO ACTION']);
    }

    private function unusedPhone(): string
    {
        do {
            $phone = (string) random_int(20000000, 99999999);
        } while (DB::table('clientes')->where('telefono', $phone)->exists());

        return $phone;
    }
}
