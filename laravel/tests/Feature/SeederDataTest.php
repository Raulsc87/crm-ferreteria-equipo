<?php

namespace Tests\Feature;

use Carbon\CarbonImmutable;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\SectorSeeder;
use Database\Seeders\SeedData;
use Database\Seeders\VerificacionSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Tests\Support\SeedControlQueries;
use Tests\TestCase;

class SeederDataTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('crm_laravel_test@127.0.0.1', DB::selectOne('SELECT CURRENT_USER() AS account')->account);
        SeedData::requireEmptyBusinessTables();
    }

    public function test_common_seed_matches_section_11(): void
    {
        $this->seed(VerificacionSeeder::class);
        $this->assertCounts([7, 5, 21, 11, 13, 43, 4]);
        $this->assertCommonData();
        $this->assertControls();
        $before = $this->snapshot();
        try {
            $this->seed(VerificacionSeeder::class);
            $this->fail('Una segunda carga no debe sobrescribir datos.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('vacías', $exception->getMessage());
        }
        $this->assertSame($before, $this->snapshot());
    }

    public function test_database_seeder_loads_both_modalities_in_order(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->assertCounts([11, 10, 28, 17, 19, 62, 8]);
        $this->assertCommonData();
        $this->assertControls();
        $sectorUsers = DB::table('users')->where('email', 'like', '%@ferreteria.test')->pluck('id');
        $stages = DB::table('oportunidades')->whereIn('vendedor_id', $sectorUsers)->orderBy('etapa')->pluck('etapa')->all();
        sort($stages);
        $this->assertSame(['calificado', 'ganada', 'negociacion', 'perdida', 'propuesta', 'prospecto'], $stages);
        $this->assertSame(2, DB::table('users')->whereIn('id', $sectorUsers)->where('rol', 'supervisor')->count());
        $this->assertSame(2, DB::table('users')->whereIn('id', $sectorUsers)->where('rol', 'vendedor')->count());
        $this->assertFalse(DB::table('clientes')->select('vendedor_id')->whereNotNull('vendedor_id')->groupBy('vendedor_id')->havingRaw('COUNT(*) > 10')->exists());
        $this->assertFalse(DB::table('oportunidad_productos as l')->join('productos as p', 'p.id', '=', 'l.producto_id')->whereColumn('l.cantidad', '<', 'p.cantidad_minima')->exists());
        $this->assertSame(3, DB::table('productos')->where('cantidad_minima', '>', 1)->count());
        $this->assertFalse(DB::table('users')->where('email', 'test@example.com')->exists());
        foreach (DB::table('clientes')->whereNotNull('nit')->pluck('nit') as $nit) {
            $body = substr($nit, 0, -1);
            $sum = 0;
            foreach (str_split(strrev($body)) as $index => $digit) {
                $sum += (int) $digit * ($index + 2);
            }
            $digit = (11 - $sum % 11) % 11;
            $this->assertSame($digit === 10 ? 'K' : (string) $digit, substr($nit, -1));
        }
        $this->assertSame(['ventas' => 4, 'total' => '22450.00', 'pronostico' => '7190.13', 'cartera' => 21],
            SeedControlQueries::summary(DB::table('users')->pluck('email')->all(), '2026-10'));
    }

    public function test_sector_preserves_every_common_row_and_rejects_repeat(): void
    {
        $this->seed(VerificacionSeeder::class);
        $common = $this->snapshot();
        $this->seed(SectorSeeder::class);
        foreach ($common as $table => $rows) {
            $this->assertSame($rows, DB::table($table)->whereIn('id', array_column($rows, 'id'))->orderBy('id')->get()->map(fn ($row) => (array) $row)->all());
        }
        $combined = $this->snapshot();
        try {
            $this->seed(SectorSeeder::class);
            $this->fail('Una segunda carga no debe sobrescribir el sector.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('no se sobrescriben', $exception->getMessage());
        }
        $this->assertSame($combined, $this->snapshot());
    }

    private function assertCommonData(): void
    {
        $accounts = DB::table('users as u')->leftJoin('users as s', 's.id', '=', 'u.supervisor_id')
            ->whereIn('u.email', SeedControlQueries::COMMON_EMAILS)->orderBy('u.email')
            ->get(['u.name', 'u.email', 'u.rol', 'u.activo', 's.email as supervisor'])
            ->map(fn ($row) => [$row->name, $row->email, $row->rol, $row->activo, $row->supervisor])->all();
        $this->assertSame([
            ['Alicia Morales', 'admin@crm.test', 'administrador', 1, null],
            ['Carlos Ajú', 'carlos@crm.test', 'vendedor', 1, 'sandra@crm.test'],
            ['Diego Castillo', 'diego@crm.test', 'vendedor', 1, 'sergio@crm.test'],
            ['Iván Toj', 'ivan@crm.test', 'vendedor', 0, 'sandra@crm.test'],
            ['Sandra Pérez', 'sandra@crm.test', 'supervisor', 1, null],
            ['Sergio Ruiz', 'sergio@crm.test', 'supervisor', 1, null],
            ['Valeria López', 'valeria@crm.test', 'vendedor', 1, 'sergio@crm.test'],
        ], $accounts);
        foreach (DB::table('users')->get() as $user) {
            $this->assertSame('bcrypt', password_get_info($user->password)['algoName']);
            $this->assertTrue(Hash::check(SeedData::PUBLIC_PASSWORD, $user->password));
        }
        foreach ([
            ['Plan básico', '1200.00', 1], ['Plan avanzado', '2750.50', 1], ['Instalación', '450.00', 1],
            ['Soporte anual', '3600.00', 1], ['Licencia anterior', '999.99', 0],
        ] as [$name, $price, $active]) {
            $p = DB::table('productos')->where('nombre', $name)->first();
            $this->assertSame([$price, $active, 1], [$p->precio, $p->activo, $p->cantidad_minima]);
        }
        foreach ([
            ['Comercial El Quetzal', 'valeria', '4521817K', '55551234', 'compras@elquetzal.test'],
            ['Ferretería Xela', 'valeria', '98765434', '77612345', null],
            ['María Coyoy', 'valeria', null, '41234567', null],
            ['Farmacia Los Altos', 'diego', '34567895', '77634567', 'gerencia@losaltos.test'],
            ['Luis Tzul', 'diego', null, '52345678', null],
            ['Abarrotes San Juan', 'carlos', '12345679', '77651001', null],
            ['Panadería La Esperanza', 'carlos', null, '30001002', null],
            ['Taller El Volcán', 'carlos', '22233342', '77651003', null],
            ['Ana Xicará', 'carlos', null, '30001004', null],
            ['Librería Cantel', 'carlos', '55566677', '77651005', null],
            ['Pedro Batz', 'carlos', null, '30001006', null],
            ['Tienda La Bendición', 'carlos', null, '30001007', null],
            ['Distribuidora Occidente', 'carlos', '77788893', '77651008', null],
            ['Rosa Tax', 'carlos', null, '30001009', null],
            ['Hotel Los Pinos', 'ivan', '66655544', '77661001', null],
            ['Agencia Cuatro Caminos', null, null, '30002001', null],
            ['Café Zunil', null, null, '30002002', null],
            ['Clínica San Rafael', null, '8889990K', '77672003', null],
            ['Constructora Altiplano', null, '44433328', '77672004', null],
            ['Escuela Futuro', null, null, '30002005', null],
            ['Gimnasio Fuerza', null, null, '30002006', null],
        ] as [$name, $seller, $nit, $phone, $email]) {
            $c = DB::table('clientes as c')->leftJoin('users as u', 'u.id', '=', 'c.vendedor_id')->where('c.nombre', $name)->first(['c.*', 'u.email as seller']);
            $this->assertSame([$seller === null ? null : $seller.'@crm.test', $nit, $phone, $email], [$c->seller, $c->nit, $c->telefono, $c->correo]);
        }
        foreach ([
            ['Renovación de planes', 'Comercial El Quetzal', 'valeria', 'ganada', '2026-10-05 16:00:00', [['Plan avanzado', 2, '2600.00'], ['Instalación', 1, '450.00']]],
            ['Equipo para sucursal', 'Ferretería Xela', 'valeria', 'ganada', '2026-11-01 03:30:00', [['Plan básico', 3, '1200.00']]],
            ['Soporte del hogar', 'María Coyoy', 'valeria', 'ganada', '2026-11-01 06:30:00', [['Soporte anual', 1, '3600.00']]],
            ['Ampliación a bodega', 'Comercial El Quetzal', 'valeria', 'negociacion', null, [['Plan avanzado', 1, '2750.50']]],
            ['Capacitación de personal', 'Ferretería Xela', 'valeria', 'propuesta', null, [['Instalación', 2, '450.00']]],
            ['Plan familiar', 'María Coyoy', 'valeria', 'perdida', '2026-10-20 18:00:00', [['Plan básico', 1, '1200.00'], ['Licencia anterior', 1, '999.99']]],
            ['Seguimiento anual', 'Comercial El Quetzal', 'valeria', 'prospecto', null, []],
            ['Licencias de caja', 'Farmacia Los Altos', 'diego', 'ganada', '2026-10-10 15:00:00', [['Plan básico', 2, '1200.00'], ['Soporte anual', 1, '3600.00']]],
            ['Mantenimiento', 'Luis Tzul', 'diego', 'calificado', null, [['Instalación', 1, '450.00']]],
            ['Plan anual', 'Abarrotes San Juan', 'carlos', 'ganada', '2026-10-15 20:00:00', [['Soporte anual', 2, '3600.00']]],
            ['Cotización de equipo', 'Taller El Volcán', 'carlos', 'negociacion', null, [['Plan avanzado', 2, '2750.50']]],
        ] as [$title, $client, $seller, $stage, $close, $expectedLines]) {
            $o = DB::table('oportunidades as o')->join('clientes as c', 'c.id', '=', 'o.cliente_id')->join('users as u', 'u.id', '=', 'o.vendedor_id')
                ->where('o.titulo', $title)->first(['o.*', 'c.nombre as client', 'u.email as seller']);
            $this->assertSame([$client, $seller.'@crm.test', $stage, $close, $stage === 'perdida' ? 'Eligió a la competencia' : null], [$o->client, $o->seller, $o->etapa, $o->fecha_cierre, $o->motivo_perdida]);
            $actualLines = DB::table('oportunidad_productos as l')->join('productos as p', 'p.id', '=', 'l.producto_id')->where('l.oportunidad_id', $o->id)->get(['p.nombre', 'l.cantidad', 'l.precio_unitario'])->map(fn ($l) => [$l->nombre, $l->cantidad, $l->precio_unitario])->all();
            sort($expectedLines);
            sort($actualLines);
            $this->assertSame($expectedLines, $actualLines);
            $history = DB::table('historial_etapas')->where('oportunidad_id', $o->id)->orderBy('created_at')->get();
            $expected = match ($stage) {
                'prospecto' => ['prospecto'],
                'calificado' => ['prospecto', 'calificado'],
                'propuesta' => ['prospecto', 'calificado', 'propuesta'],
                'negociacion' => ['prospecto', 'calificado', 'propuesta', 'negociacion'],
                'ganada' => ['prospecto', 'calificado', 'propuesta', 'negociacion', 'ganada'],
                'perdida' => ['prospecto', 'calificado', 'propuesta', 'perdida'],
            };
            $this->assertSame($expected, $history->pluck('etapa_nueva')->all());
            $this->assertSame($close ?? '2026-10-02 16:00:00', $history->last()->created_at);
            foreach ($history as $i => $entry) {
                $this->assertSame([$o->vendedor_id, $i === 0 ? null : $expected[$i - 1]], [$entry->usuario_id, $entry->etapa_anterior]);
                if ($i > 0) {
                    $this->assertSame(3.0, CarbonImmutable::parse($history[$i - 1]->created_at, 'UTC')->diffInDays(CarbonImmutable::parse($entry->created_at, 'UTC')));
                }
            }
            $this->assertSame($o->created_at, $history->first()->created_at);
        }
        foreach ([
            ['Comercial El Quetzal', 'valeria@crm.test', 'llamada', 'Confirmar fecha de instalación', '2026-10-08 15:00:00', 1],
            ['Ferretería Xela', 'valeria@crm.test', 'tarea', 'Enviar propuesta de capacitación', '2030-01-15 15:00:00', 0],
            ['María Coyoy', 'valeria@crm.test', 'reunion', 'Presentar opciones de soporte', '2026-09-01 15:00:00', 0],
            ['Farmacia Los Altos', 'diego@crm.test', 'llamada', 'Renovación de licencias', '2030-02-01 15:00:00', 0],
        ] as [$client, $seller, $type, $description, $due, $done]) {
            $a = DB::table('actividades as a')->join('clientes as c', 'c.id', '=', 'a.cliente_id')->join('users as u', 'u.id', '=', 'a.vendedor_id')
                ->where('a.descripcion', $description)->first(['c.nombre', 'u.email', 'a.tipo', 'a.vence_en', 'a.completada']);
            $this->assertSame([$client, $seller, $type, $due, $done], [$a->nombre, $a->email, $a->tipo, $a->vence_en, $a->completada]);
        }
    }

    private function assertControls(): void
    {
        $expected = [
            [2, '9250.00', '2512.88', 3], [1, '3600.00', '2512.88', 3],
            [1, '6000.00', '112.50', 2], [1, '7200.00', '4125.75', 9],
            [3, '15250.00', '2625.38', 5], [1, '7200.00', '4125.75', 10],
            [4, '22450.00', '6751.13', 15],
        ];
        $this->assertSame($expected, array_map('array_values', array_values(SeedControlQueries::controls())));
        $this->assertSame([
            ['Instalación', 1, '450.00'], ['Plan avanzado', 2, '5200.00'],
            ['Plan básico', 5, '6000.00'], ['Soporte anual', 3, '10800.00'],
        ], SeedControlQueries::productSales());
        $this->assertSame('2026-10-31 21:30:00', CarbonImmutable::parse('2026-11-01 03:30:00', 'UTC')->setTimezone('America/Guatemala')->format('Y-m-d H:i:s'));
        $this->assertSame('2026-11-01 00:30:00', CarbonImmutable::parse('2026-11-01 06:30:00', 'UTC')->setTimezone('America/Guatemala')->format('Y-m-d H:i:s'));
    }

    private function assertCounts(array $counts): void
    {
        $this->assertSame($counts, array_map(fn ($table) => DB::table($table)->count(), SeedData::TABLES));
    }

    private function snapshot(): array
    {
        $rows = [];
        foreach (SeedData::TABLES as $table) {
            $rows[$table] = DB::table($table)->orderBy('id')->get()->map(fn ($row) => (array) $row)->all();
        }

        return $rows;
    }
}
