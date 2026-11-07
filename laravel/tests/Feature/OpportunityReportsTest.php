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

class OpportunityReportsTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('crm_laravel_test@127.0.0.1', DB::selectOne('SELECT CURRENT_USER() AS account')->account);
        $this->seed(VerificacionSeeder::class);
    }

    #[DataProvider('octoberControls')]
    public function test_october_summary_matches_section_11(string $user, int $sales, string $total, string $forecast): void
    {
        $page = $this->actingAs($this->user($user))->get('/reportes?mes=2026-10')->assertOk();
        $this->assertSame([$sales, $total, $forecast], $this->figures($page->viewData('summary')));
        $page->assertSee('2026-10')->assertSee('America/Guatemala');
    }

    public static function octoberControls(): array
    {
        return [['admin', 4, '22450.00', '6751.13'], ['sergio', 3, '15250.00', '2625.38'], ['sandra', 1, '7200.00', '4125.75']];
    }

    public function test_seller_breakdown_includes_inactive_and_zero_values_without_duplicate_sales(): void
    {
        $page = $this->actingAs($this->user('admin'))->get('/reportes?mes=2026-10')->assertOk();
        $actual = $page->viewData('sellers')->mapWithKeys(fn ($seller) => [$seller->name => $this->figures($seller)])->all();
        $this->assertSame([
            'Carlos Ajú' => [1, '7200.00', '4125.75'], 'Diego Castillo' => [1, '6000.00', '112.50'],
            'Iván Toj' => [0, '0.00', '0.00'], 'Valeria López' => [2, '9250.00', '2512.88'],
        ], $actual);
        $page->assertSee('Inactivo')->assertSee('Q0.00');
    }

    public function test_product_breakdown_matches_historical_units_and_amounts(): void
    {
        $page = $this->actingAs($this->user('admin'))->get('/reportes?mes=2026-10')->assertOk();
        $actual = $page->viewData('products')->mapWithKeys(fn ($product) => [$product->nombre => [
            (int) $product->unidades, (string) $product->total, (string) $product->pronostico,
        ]])->all();
        $this->assertSame([
            'Instalación' => [1, '450.00', '562.50'], 'Licencia anterior' => [0, '0.00', '0.00'],
            'Plan avanzado' => [2, '5200.00', '6188.63'], 'Plan básico' => [5, '6000.00', '0.00'],
            'Soporte anual' => [3, '10800.00', '0.00'],
        ], $actual);
        $this->assertSame(4, (int) $page->viewData('summary')->ventas);
        // Ventas por producto no son aditivas: una venta puede incluir varios productos.
        $this->assertSame(6, $page->viewData('products')->sum('ventas'));
    }

    public function test_supervisor_report_does_not_include_other_sellers_or_their_product_sales(): void
    {
        $page = $this->actingAs($this->user('sergio'))->get('/reportes?mes=2026-10')->assertOk();
        $page->assertSee('Valeria López')->assertSee('Diego Castillo')->assertDontSee('Carlos Ajú')->assertDontSee('Iván Toj');
        $support = $page->viewData('products')->firstWhere('nombre', 'Soporte anual');
        $this->assertSame([1, '3600.00'], [(int) $support->unidades, (string) $support->total]);
        $page = $this->actingAs($this->user('sandra'))->get('/reportes?mes=2026-10')->assertOk();
        $this->assertSame(['Plan avanzado', 'Soporte anual'], $page->viewData('products')->pluck('nombre')->all());
        $page->assertDontSee('Valeria López')->assertDontSee('Diego Castillo');
    }

    public function test_november_and_month_without_sales_keep_all_open_forecast(): void
    {
        $this->actingAs($this->user('admin'));
        $november = $this->get('/reportes?mes=2026-11')->assertOk();
        $this->assertSame([1, '3600.00', '6751.13'], $this->figures($november->viewData('summary')));
        $future = $this->get('/reportes?mes=2099-02')->assertOk();
        $this->assertSame([0, '0.00', '6751.13'], $this->figures($future->viewData('summary')));
    }

    public function test_default_month_changes_at_guatemala_midnight_not_utc_midnight(): void
    {
        $this->actingAs($this->user('admin'));
        try {
            CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-01 05:59:59', 'UTC'));
            $october = $this->get('/reportes')->assertOk();
            $this->assertSame('2026-10', $october->viewData('month'));
            $this->assertSame(4, (int) $october->viewData('summary')->ventas);
            CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-01 06:00:00', 'UTC'));
            $november = $this->get('/reportes')->assertOk();
            $this->assertSame('2026-11', $november->viewData('month'));
            $this->assertSame(1, (int) $november->viewData('summary')->ventas);
        } finally {
            CarbonImmutable::setTestNow();
        }
    }

    public function test_report_includes_exact_start_and_excludes_next_start(): void
    {
        DB::table('oportunidades')->where('titulo', 'Renovación de planes')->update(['fecha_cierre' => '2026-10-01 06:00:00']);
        DB::table('oportunidades')->where('titulo', 'Equipo para sucursal')->update(['fecha_cierre' => '2026-11-01 06:00:00']);
        $page = $this->actingAs($this->user('sergio'))->get('/reportes?mes=2026-10')->assertOk();
        $this->assertSame([2, '11650.00', '2625.38'], $this->figures($page->viewData('summary')));
        DB::table('oportunidades')->where('titulo', 'Renovación de planes')->update(['fecha_cierre' => '2026-10-01 05:59:59']);
        $page = $this->get('/reportes?mes=2026-10')->assertOk();
        $this->assertSame([1, '6000.00', '2625.38'], $this->figures($page->viewData('summary')));
    }

    public function test_forecast_rounds_sum_not_each_opportunity_or_each_seller(): void
    {
        foreach (['carlos', 'ivan'] as $email) {
            $seller = $this->user($email);
            $id = DB::table('oportunidades')->insertGetId([
                'vendedor_id' => $seller->id, 'cliente_id' => DB::table('clientes')->where('vendedor_id', $seller->id)->value('id'),
                'titulo' => 'Precisión del pronóstico', 'etapa' => 'prospecto',
            ]);
            DB::table('oportunidad_productos')->insert([
                'oportunidad_id' => $id, 'producto_id' => DB::table('productos')->value('id'), 'cantidad' => 1, 'precio_unitario' => '0.05',
            ]);
        }
        $page = $this->actingAs($this->user('sandra'))->get('/reportes?mes=2026-10')->assertOk();
        $this->assertSame('4125.76', (string) $page->viewData('summary')->pronostico);
        $this->assertSame(['4125.76', '0.01'], $page->viewData('sellers')->pluck('pronostico')->all());
    }

    public function test_price_minimum_and_activation_do_not_change_report_or_opportunity_totals(): void
    {
        $this->actingAs($this->user('admin'));
        $before = $this->get('/reportes?mes=2026-10')->viewData('products')->toJson();
        DB::table('productos')->update(['precio' => '99999999.99', 'cantidad_minima' => 999, 'activo' => false]);
        $after = $this->get('/reportes?mes=2026-10')->assertOk();
        $this->assertSame($before, $after->viewData('products')->toJson());
        $this->assertSame([4, '22450.00', '6751.13'], $this->figures($after->viewData('summary')));
        $this->get('/oportunidades')->assertOk()->assertSee('Q5,650.00');
    }

    public function test_current_team_and_historical_seller_are_used_after_reassignment(): void
    {
        DB::table('clientes')->where('nombre', 'María Coyoy')->update(['vendedor_id' => $this->user('carlos')->id]);
        $this->actingAs($this->user('sergio'))->get('/oportunidades')->assertOk()->assertSee('Soporte del hogar');
        $page = $this->get('/reportes?mes=2026-11')->assertOk();
        $this->assertSame([1, '3600.00', '2625.38'], $this->figures($page->viewData('summary')));
        $this->user('valeria')->update(['supervisor_id' => $this->user('sandra')->id, 'activo' => false]);
        $page = $this->get('/reportes?mes=2026-10')->assertOk();
        $this->assertSame([1, '6000.00', '112.50'], $this->figures($page->viewData('summary')));
        $this->get('/oportunidades')->assertOk()->assertDontSee('Soporte del hogar');
    }

    public function test_admin_keeps_all_opportunities_when_historical_owner_changes_role(): void
    {
        $this->user('valeria')->update(['rol' => 'administrador', 'supervisor_id' => null]);
        $this->actingAs($this->user('admin'))->get('/oportunidades')->assertOk()->assertSee('Renovación de planes');
        $page = $this->get('/reportes?mes=2026-10')->assertOk();
        $this->assertSame([4, '22450.00', '6751.13'], $this->figures($page->viewData('summary')));
        $this->assertSame([2, '9250.00', '2512.88'], $this->figures($page->viewData('sellers')->firstWhere('name', 'Valeria López')));
    }

    public function test_list_scope_totals_and_guatemala_dates(): void
    {
        foreach (['admin' => 11, 'sergio' => 9, 'sandra' => 2] as $email => $count) {
            $page = $this->actingAs($this->user($email))->get('/oportunidades')->assertOk();
            $this->assertSame($count, $page->viewData('opportunities')->total());
        }
        $page = $this->actingAs($this->user('sergio'))->get('/oportunidades')->assertOk();
        $page->assertSee('Comercial El Quetzal')->assertSee('Q5,650.00')->assertSee('Q0.00')
            ->assertSee('31/10/2026 21:30')->assertSee('01/11/2026 00:30')->assertSee('Sin cierre')
            ->assertDontSee('Carlos Ajú')->assertDontSee('Abarrotes San Juan')->assertDontSee('Plan anual');
    }

    public function test_combined_filters_narrow_scope_and_can_return_empty(): void
    {
        $this->actingAs($this->user('sergio'));
        $url = '/oportunidades?etapa=ganada&vendedor_id='.$this->user('valeria')->id;
        $page = $this->get($url)->assertOk();
        $this->assertSame(3, $page->viewData('opportunities')->total());
        $page->assertDontSee('Ampliación a bodega')->assertDontSee('Licencias de caja');
        $empty = $this->get('/oportunidades?etapa=prospecto&vendedor_id='.$this->user('diego')->id)->assertOk();
        $empty->assertSee('No hay oportunidades para los filtros seleccionados.');
        $this->assertSame(0, $empty->viewData('opportunities')->total());
        $this->actingAs($this->user('admin'))->get('/oportunidades?vendedor_id='.$this->user('ivan')->id)->assertOk()->assertSee('No hay oportunidades');
    }

    public function test_foreign_seller_and_parameter_manipulation_return_404(): void
    {
        $this->actingAs($this->user('sergio'));
        foreach ([$this->user('carlos')->id, 999999999] as $id) {
            $this->get('/oportunidades?vendedor_id='.$id)->assertNotFound();
        }
        $id = DB::table('oportunidades')->where('titulo', 'Plan anual')->value('id');
        $this->get('/oportunidades/'.$id)->assertNotFound();
        $this->get('/oportunidades?supervisor_id='.$this->user('sandra')->id)->assertNotFound();
        $this->get('/reportes?supervisor_id='.$this->user('sandra')->id)->assertNotFound();
        $this->get('/reportes?vendedor_id='.$this->user('carlos')->id)->assertNotFound();
    }

    #[DataProvider('invalidFilters')]
    public function test_invalid_filters_are_validated_in_spanish(string $query, string $field, string $message): void
    {
        $this->actingAs($this->user('sergio'))->getJson('/oportunidades?'.$query)->assertUnprocessable()
            ->assertJsonValidationErrors($field)->assertJsonPath('errors.'.$field.'.0', $message);
    }

    public static function invalidFilters(): array
    {
        return [
            ['etapa=otra', 'etapa', 'Seleccione una etapa válida.'],
            ['etapa[]=ganada', 'etapa', 'Seleccione una etapa válida.'],
            ['vendedor_id=1+OR+1%3D1', 'vendedor_id', 'Seleccione un vendedor válido.'],
            ['vendedor_id[]=1', 'vendedor_id', 'Seleccione un vendedor válido.'],
            ['vendedor_id=-1', 'vendedor_id', 'Seleccione un vendedor válido.'],
            ['page=0', 'page', 'Seleccione una página válida.'],
        ];
    }

    #[DataProvider('invalidMonths')]
    public function test_invalid_report_months_are_validated(string $query): void
    {
        $this->actingAs($this->user('admin'))->getJson('/reportes?'.$query)->assertUnprocessable()
            ->assertJsonValidationErrors('mes')->assertJsonPath('errors.mes.0', 'Seleccione un mes válido entre 1000-01 y 9998-12.');
    }

    public static function invalidMonths(): array
    {
        return [['mes=2026-13'], ['mes=2026-1'], ['mes='], ['mes[]=2026-10'], ['mes=2026-10+OR+1%3D1']];
    }

    public function test_html_errors_and_filter_selection(): void
    {
        $response = $this->actingAs($this->user('sergio'))->from('/oportunidades?etapa=ganada')
            ->get('/oportunidades?etapa=mal')->assertSessionHasErrors('etapa');
        $this->withCookie(config('session.cookie'), $response->getCookie(config('session.cookie'))->getValue());
        $this->get('/oportunidades?etapa=ganada')->assertOk()->assertSee('Seleccione una etapa válida.')
            ->assertSee('value="ganada"', false);
        $seller = $this->user('diego');
        $response = $this->from('/oportunidades')->get('/oportunidades?etapa=mal&vendedor_id='.$seller->id)
            ->assertSessionHasErrors('etapa')->assertSessionHasInput('vendedor_id', (string) $seller->id);
        $this->withCookie(config('session.cookie'), $response->getCookie(config('session.cookie'))->getValue());
        $this->get('/oportunidades')->assertOk()->assertSee('value="'.$seller->id.'" selected', false);
        $response = $this->from('/reportes?mes=2026-10')->get('/reportes?mes=mal')->assertSessionHasErrors('mes');
        $this->withCookie(config('session.cookie'), $response->getCookie(config('session.cookie'))->getValue());
        $this->get('/reportes?mes=2026-10')->assertOk()->assertSee('Seleccione un mes válido');
    }

    public function test_empty_team_has_zero_summary_and_empty_tables(): void
    {
        $supervisor = User::create(['name' => 'Sin vendedores', 'email' => 'vacio@crm.test', 'rol' => 'supervisor', 'activo' => true, 'password' => SeedData::PUBLIC_PASSWORD]);
        $page = $this->actingAs($supervisor)->get('/reportes?mes=2026-10')->assertOk();
        $this->assertSame([0, '0.00', '0.00'], $this->figures($page->viewData('summary')));
        $page->assertSee('Usted no tiene vendedores')->assertSee('No hay productos cotizados');
        $this->get('/oportunidades')->assertOk()->assertSee('No hay oportunidades');
    }

    public function test_permissions_refresh_current_state_and_show_links_only_to_panel_users(): void
    {
        foreach (['/oportunidades', '/reportes'] as $path) {
            $this->get($path)->assertRedirect('/login');
            $this->actingAs($this->user('valeria'))->get($path)->assertRedirect('/login');
            $this->actingAs($this->user('sergio'))->get($path)->assertOk()->assertSee('Oportunidades')->assertSee('Reportes');
            DB::table('users')->where('id', $this->user('sergio')->id)->update(['activo' => false]);
            $this->get($path)->assertRedirect('/login');
            $this->assertGuest();
            DB::table('users')->where('email', 'sergio@crm.test')->update(['activo' => true]);
        }
    }

    public function test_pages_escape_text_do_not_expose_contacts_and_never_write_business_data(): void
    {
        $text = '<script>alert(1)</script>';
        DB::table('oportunidades')->where('titulo', 'Plan anual')->update(['titulo' => $text]);
        DB::table('productos')->where('nombre', 'Soporte anual')->update(['nombre' => $text]);
        $before = $this->snapshot();
        $this->actingAs($this->user('admin'));
        foreach (['/oportunidades', '/reportes?mes=2026-10'] as $path) {
            $this->get($path)->assertOk()->assertSee(e($text), false)->assertDontSee($text, false)
                ->assertDontSee('55551234')->assertDontSee('4521817K')->assertDontSee($this->user('valeria')->password, false);
        }
        foreach (['post', 'put', 'patch', 'delete'] as $method) {
            $this->{$method}('/oportunidades')->assertStatus(405);
            $this->{$method}('/reportes')->assertStatus(405);
        }
        $this->assertSame($before, $this->snapshot());
    }

    private function user(string $name): User
    {
        return User::where('email', $name.'@crm.test')->firstOrFail();
    }

    private function figures(object $row): array
    {
        return [(int) $row->ventas, (string) $row->total, (string) $row->pronostico];
    }

    private function snapshot(): array
    {
        $rows = [];
        foreach (SeedData::TABLES as $table) {
            $rows[$table] = DB::table($table)->orderBy('id')->get()->toJson();
        }

        return $rows;
    }
}
