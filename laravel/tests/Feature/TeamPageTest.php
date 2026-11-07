<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\SeedData;
use Database\Seeders\VerificacionSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class TeamPageTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('crm_laravel_test@127.0.0.1', DB::selectOne('SELECT CURRENT_USER() AS account')->account);
        $this->seed(VerificacionSeeder::class);
    }

    public function test_sergio_sees_only_his_team_and_exact_october_controls(): void
    {
        $page = $this->actingAs($this->user('sergio'))->get('/mi-equipo?mes=2026-10')
            ->assertOk()->assertSee('2026-10')->assertSee('America/Guatemala')
            ->assertSee('Valeria López')->assertSee('Diego Castillo')
            ->assertDontSee('Carlos Ajú')->assertDontSee('Iván Toj')
            ->assertSee('Q9,250.00')->assertSee('Q6,000.00');
        $this->assertSame([
            'Diego Castillo' => [true, 2, 1, '6000.00'],
            'Valeria López' => [true, 3, 2, '9250.00'],
        ], $this->figures($page->viewData('sellers')));
        $this->assertSame(3, $page->viewData('sellers')->sum('ventas'));
        $this->actingAs($this->user('sergio'))->get('/dashboard')->assertSee('Mi equipo')->assertDontSee('Productos');
    }

    public function test_sandra_sees_inactive_seller_zero_sales_and_current_portfolios(): void
    {
        $page = $this->actingAs($this->user('sandra'))->get('/mi-equipo?mes=2026-10')
            ->assertOk()->assertSee('Inactivo')->assertSee('9 de 10')->assertSee('1 de 10')->assertSee('Q0.00');
        $this->assertSame([
            'Carlos Ajú' => [true, 9, 1, '7200.00'],
            'Iván Toj' => [false, 1, 0, '0.00'],
        ], $this->figures($page->viewData('sellers')));
        $page->assertDontSee('Valeria López')->assertDontSee('Diego Castillo');
    }

    public function test_november_uses_historic_closing_dates_not_current_client_owner(): void
    {
        // Cambiar la cartera no cambia el vendedor acreditado en ventas cerradas.
        DB::table('clientes')->where('nombre', 'María Coyoy')
            ->update(['vendedor_id' => $this->user('carlos')->id]);
        $page = $this->actingAs($this->user('sergio'))->get('/mi-equipo?mes=2026-11')->assertOk();
        $this->assertSame([
            'Diego Castillo' => [true, 2, 0, '0.00'],
            'Valeria López' => [true, 2, 1, '3600.00'],
        ], $this->figures($page->viewData('sellers')));
    }

    public function test_catalog_price_and_minimum_changes_do_not_change_historical_sales(): void
    {
        DB::table('productos')->where('nombre', 'Plan avanzado')->update(['precio' => '99999999.99', 'cantidad_minima' => 999, 'activo' => false]);
        $page = $this->actingAs($this->user('sergio'))->get('/mi-equipo?mes=2026-10')->assertOk();
        $this->assertSame('9250.00', $this->figures($page->viewData('sellers'))['Valeria López'][3]);
    }

    public function test_default_month_uses_guatemala_even_when_utc_is_already_next_month(): void
    {
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-01 03:30:00', 'UTC'));
        try {
            $page = $this->actingAs($this->user('sergio'))->get('/mi-equipo')->assertOk();
            $this->assertSame('2026-10', $page->viewData('month'));
            $page->assertSee('Q9,250.00');
            CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-01 06:00:00', 'UTC'));
            $page = $this->get('/mi-equipo')->assertOk();
            $this->assertSame('2026-11', $page->viewData('month'));
            $page->assertSee('Q3,600.00');
        } finally {
            CarbonImmutable::setTestNow();
        }
    }

    public function test_month_interval_includes_start_and_excludes_next_start_exactly(): void
    {
        $seller = $this->user('diego');
        $client = DB::table('clientes')->where('vendedor_id', $seller->id)->value('id');
        $product = DB::table('productos')->value('id');
        foreach (['2026-10-01 05:59:59', '2026-10-01 06:00:00', '2026-11-01 05:59:59', '2026-11-01 06:00:00'] as $close) {
            $id = DB::table('oportunidades')->insertGetId([
                'cliente_id' => $client, 'vendedor_id' => $seller->id,
                'titulo' => 'Frontera mensual', 'etapa' => 'ganada', 'fecha_cierre' => $close,
            ]);
            DB::table('oportunidad_productos')->insert([
                'oportunidad_id' => $id, 'producto_id' => $product, 'cantidad' => 1, 'precio_unitario' => '0.01',
            ]);
        }
        $page = $this->actingAs($this->user('sergio'))->get('/mi-equipo?mes=2026-10')->assertOk();
        $this->assertSame([true, 2, 3, '6000.02'], $this->figures($page->viewData('sellers'))['Diego Castillo']);
        $november = $this->get('/mi-equipo?mes=2026-11')->assertOk();
        $this->assertSame([true, 2, 1, '0.01'], $this->figures($november->viewData('sellers'))['Diego Castillo']);
    }

    public function test_current_team_membership_and_inactive_seller_sales_are_used(): void
    {
        $this->actingAs($this->user('sergio'));
        $this->user('valeria')->update(['supervisor_id' => $this->user('sandra')->id, 'activo' => false]);
        $this->get('/mi-equipo?mes=2026-10')->assertOk()->assertDontSee('Valeria López')->assertDontSee('Q9,250.00');
        $page = $this->actingAs($this->user('sandra'))->get('/mi-equipo?mes=2026-10')->assertOk();
        $this->assertSame([false, 3, 2, '9250.00'], $this->figures($page->viewData('sellers'))['Valeria López']);
    }

    public function test_supervisor_without_sellers_and_month_without_sales(): void
    {
        $empty = User::create(['name' => 'Supervisor nuevo', 'email' => 'nuevo@crm.test', 'rol' => 'supervisor', 'activo' => true, 'password' => SeedData::PUBLIC_PASSWORD]);
        $this->actingAs($empty)->get('/mi-equipo')->assertOk()->assertSee('Usted todavía no tiene vendedores asignados.');
        $page = $this->actingAs($this->user('sergio'))->get('/mi-equipo?mes=2027-02')->assertOk();
        $this->assertSame([
            'Diego Castillo' => [true, 2, 0, '0.00'],
            'Valeria López' => [true, 3, 0, '0.00'],
        ], $this->figures($page->viewData('sellers')));
    }

    public function test_guest_admin_seller_and_inactive_supervisor_cannot_access(): void
    {
        $this->get('/mi-equipo')->assertRedirect('/login');
        $this->actingAs($this->user('admin'))->get('/mi-equipo')->assertForbidden();
        $this->get('/dashboard')->assertDontSee('Mi equipo');
        $this->actingAs($this->user('valeria'))->get('/mi-equipo')->assertRedirect('/login');
        $supervisor = $this->user('sergio');
        $this->actingAs($supervisor);
        $supervisor->update(['activo' => false]);
        $this->get('/mi-equipo')->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_existing_session_cannot_keep_supervisor_permission_after_role_change(): void
    {
        $supervisor = $this->user('sergio');
        $this->actingAs($supervisor)->get('/mi-equipo')->assertOk();
        DB::table('users')->where('id', $supervisor->id)->update(['rol' => 'administrador']);
        $this->get('/mi-equipo')->assertForbidden();
    }

    public function test_team_parameters_and_foreign_resource_paths_return_404(): void
    {
        $this->actingAs($this->user('sergio'));
        foreach (['supervisor_id' => $this->user('sandra')->id, 'vendedor_id' => $this->user('carlos')->id, 'equipo_id' => $this->user('sandra')->id] as $field => $id) {
            $this->get('/mi-equipo?'.http_build_query([$field => $id, 'mes' => '2026-10']))->assertNotFound();
        }
        $this->get('/mi-equipo/'.$this->user('sandra')->id)->assertNotFound();
    }

    #[DataProvider('invalidMonths')]
    public function test_invalid_month_is_rejected_with_spanish_field_error(mixed $month): void
    {
        $this->actingAs($this->user('sergio'))->getJson('/mi-equipo?'.http_build_query(['mes' => $month]))
            ->assertUnprocessable()->assertJsonValidationErrors('mes')
            ->assertJsonPath('errors.mes.0', 'Seleccione un mes válido entre 1000-01 y 9998-12.');
    }

    public static function invalidMonths(): array
    {
        return [['2026-13'], ['2026-00'], ['2026-1'], ['2026-10-01'], [''], [['2026-10']], ['2026-10 OR 1=1'], ['0000-01'], ['9999-12']];
    }

    #[DataProvider('validMonths')]
    public function test_valid_month_boundaries_and_leap_february(string $month): void
    {
        $page = $this->actingAs($this->user('sergio'))->get('/mi-equipo?mes='.$month)->assertOk();
        $this->assertSame($month, $page->viewData('month'));
        $this->assertSame(0, $page->viewData('sellers')->sum('ventas'));
    }

    public static function validMonths(): array
    {
        return [['1000-01'], ['9998-12'], ['2024-02']];
    }

    public function test_html_month_validation_displays_error_next_to_field(): void
    {
        $response = $this->actingAs($this->user('sergio'))->from('/mi-equipo?mes=2026-10')
            ->get('/mi-equipo?mes=invalido')->assertRedirect('/mi-equipo?mes=2026-10')->assertSessionHasErrors('mes');
        $this->withCookie(config('session.cookie'), $response->getCookie(config('session.cookie'))->getValue());
        $this->get('/mi-equipo?mes=2026-10')->assertOk()->assertSee('Seleccione un mes válido');
    }

    public function test_names_are_escaped_sensitive_data_not_rendered_and_page_is_read_only(): void
    {
        $name = '<script>alert(1)</script>';
        $this->user('valeria')->update(['name' => $name]);
        $before = [];
        foreach (SeedData::TABLES as $table) {
            $before[$table] = DB::table($table)->orderBy('id')->get()->toJson();
        }
        $page = $this->actingAs($this->user('sergio'))->get('/mi-equipo?mes=2026-10')->assertOk();
        $page->assertSee(e($name), false)->assertDontSee($name, false)
            ->assertDontSee('valeria@crm.test')->assertDontSee('55551234')->assertDontSee('4521817K')
            ->assertDontSee($this->user('valeria')->password, false);
        $this->post('/mi-equipo')->assertStatus(405);
        foreach (SeedData::TABLES as $table) {
            $this->assertSame($before[$table], DB::table($table)->orderBy('id')->get()->toJson());
        }
    }

    private function user(string $email): User
    {
        return User::where('email', $email.'@crm.test')->firstOrFail();
    }

    private function figures($sellers): array
    {
        return $sellers->mapWithKeys(fn ($seller) => [$seller->name => [
            $seller->activo, (int) $seller->clients_count, (int) $seller->ventas, (string) $seller->total_vendido,
        ]])->all();
    }
}
