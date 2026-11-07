<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\VerificacionSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PanelValidationTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('crm_laravel_test@127.0.0.1', DB::selectOne('SELECT CURRENT_USER() AS account')->account);
        $this->seed(VerificacionSeeder::class);
    }

    #[DataProvider('malformedForms')]
    public function test_malformed_scalar_fields_do_not_break_the_returned_form(string $path, string $form, array $input, string $field): void
    {
        $response = $this->actingAs($this->admin())->from($form)->post($path, $input)
            ->assertRedirect($form)->assertSessionHasErrors($field)->assertSessionMissing('_old_input.'.$field);
        $message = session('errors')->first($field);
        $this->keepCookie($response);
        $this->get($form)->assertOk()->assertSee($message);
        $this->assertSame(7, User::count());
        $this->assertSame(5, DB::table('productos')->count());
        $this->assertSame(21, DB::table('clientes')->count());
    }

    public static function malformedForms(): array
    {
        return [
            ['/cuentas', '/cuentas/create', ['name' => ['No es texto']], 'name'],
            ['/cuentas', '/cuentas/create', ['email' => ['no@crm.test']], 'email'],
            ['/cuentas', '/cuentas/create', ['supervisor_id' => ['1']], 'supervisor_id'],
            ['/cuentas', '/cuentas/create', ['activo' => ['1']], 'activo'],
            ['/productos', '/productos/create', ['nombre' => ['No es texto']], 'nombre'],
            ['/productos', '/productos/create', ['precio' => ['12.50']], 'precio'],
            ['/productos', '/productos/create', ['cantidad_minima' => ['1']], 'cantidad_minima'],
            ['/productos', '/productos/create', ['activo' => ['1']], 'activo'],
            ['/clientes', '/clientes/create', ['nombre' => ['No es texto']], 'nombre'],
            ['/clientes', '/clientes/create', ['nit' => ['CF']], 'nit'],
            ['/clientes', '/clientes/create', ['vendedor_id' => ['1']], 'vendedor_id'],
        ];
    }

    public function test_client_filters_keep_search_seller_and_checkbox_with_spanish_errors(): void
    {
        $seller = User::where('email', 'valeria@crm.test')->firstOrFail();
        $response = $this->actingAs($this->admin())->from('/clientes')->get('/clientes?'.http_build_query([
            'q' => 'Texto que deseo conservar', 'vendedor_id' => $seller->id, 'sin_asignar' => '1',
        ]))->assertSessionHasErrors('vendedor_id')->assertSessionHasInput('q', 'Texto que deseo conservar');
        $this->keepCookie($response);
        $this->get('/clientes')->assertOk()->assertSee('Texto que deseo conservar')
            ->assertSee('value="'.$seller->id.'" selected', false)->assertSee('value="1" checked', false)
            ->assertSee('Use el filtro por vendedor o sin asignar, no ambos a la vez.');
        $this->getJson('/clientes?vendedor_id=0')->assertUnprocessable()
            ->assertJsonPath('errors.vendedor_id.0', 'Seleccione un vendedor válido.');
    }

    public function test_invalid_filter_array_returns_to_a_working_page(): void
    {
        $response = $this->actingAs($this->admin())->from('/clientes')->get('/clientes?q[]=texto')
            ->assertSessionHasErrors('q')->assertSessionMissing('_old_input.q');
        $this->keepCookie($response);
        $this->get('/clientes')->assertOk()->assertSee('Ingrese un nombre o NIT para buscar.');
    }

    public function test_cf_and_phone_keep_written_format_when_another_field_fails(): void
    {
        $response = $this->actingAs($this->admin())->from('/clientes/create')->post('/clientes', [
            'nombre' => 'Cliente por revisar', 'nit' => 'c-f', 'telefono' => '+502 (5900)-1112', 'correo' => 'incorrecto',
        ])->assertSessionHasErrors('correo')->assertSessionHasInput('nit', 'c-f')->assertSessionHasInput('telefono', '+502 (5900)-1112');
        $this->keepCookie($response);
        $this->get('/clientes/create')->assertOk()->assertSee('value="c-f"', false)->assertSee('value="+502 (5900)-1112"', false)
            ->assertSee('Cliente por revisar')->assertSee('Ingrese un correo electrónico válido.');
        $this->assertSame(21, DB::table('clientes')->count());
    }

    public function test_assignment_array_returns_to_confirmation_with_field_error(): void
    {
        $client = DB::table('clientes')->whereNull('vendedor_id')->first();
        $form = '/clientes/'.$client->id.'/asignacion';
        $response = $this->actingAs($this->admin())->from($form)->patch($form, [
            'confirmar' => '1', 'expected_vendedor_id' => null, 'vendedor_id' => ['1'],
        ])->assertSessionHasErrors('vendedor_id')->assertSessionMissing('_old_input.vendedor_id');
        $this->keepCookie($response);
        $this->get($form)->assertOk()->assertSee('Seleccione un vendedor válido.');
        $this->assertNull(DB::table('clientes')->where('id', $client->id)->value('vendedor_id'));
    }

    public function test_scalar_inputs_survive_but_passwords_are_never_flashed_or_filled(): void
    {
        $password = 'Temporal-Prueba-123';
        $response = $this->actingAs($this->admin())->from('/cuentas/create')->post('/cuentas', [
            'name' => 'Nombre que se conserva', 'email' => 'mal', 'password' => $password,
            'password_confirmation' => $password, 'rol' => 'supervisor', 'activo' => '1',
        ])->assertSessionHasErrors('email')->assertSessionHasInput('name', 'Nombre que se conserva')
            ->assertSessionMissing('_old_input.password')->assertSessionMissing('_old_input.password_confirmation');
        $this->keepCookie($response);
        $this->get('/cuentas/create')->assertOk()->assertSee('Nombre que se conserva')->assertSee('Ingrese un correo electrónico válido.')
            ->assertDontSee($password, false);
    }

    public function test_login_invalid_arrays_return_field_errors_without_repopulating_password(): void
    {
        $response = $this->from('/login')->post('/login', ['email' => ['no@crm.test'], 'password' => ['incorrecta']])
            ->assertSessionHasErrors(['email', 'password'])->assertSessionMissing('_old_input.email')->assertSessionMissing('_old_input.password');
        $this->keepCookie($response);
        $this->get('/login')->assertOk()->assertSee('Ingrese un correo electrónico válido.')->assertSee('Ingrese una contraseña válida.');
        $this->assertGuest();
    }

    #[DataProvider('monthPages')]
    public function test_month_form_keeps_scalar_input_and_discards_array(string $path, string $user): void
    {
        $this->actingAs(User::where('email', $user.'@crm.test')->firstOrFail());
        $response = $this->from($path)->get($path.'?mes=2026-13')->assertSessionHasErrors('mes')->assertSessionHasInput('mes', '2026-13');
        $this->keepCookie($response);
        $this->get($path)->assertOk()->assertSee('value="2026-13"', false)->assertSee('Seleccione un mes válido');
        $response = $this->from($path)->get($path.'?mes[]=2026-10')->assertSessionHasErrors('mes')->assertSessionMissing('_old_input.mes');
        $this->keepCookie($response);
        $this->get($path)->assertOk()->assertSee('Seleccione un mes válido');
    }

    public static function monthPages(): array
    {
        return [['/mi-equipo', 'sergio'], ['/reportes', 'admin']];
    }

    #[DataProvider('duplicateTables')]
    public function test_mysql_duplicate_after_validation_has_safe_field_message(string $table, string $path, string $field, string $message): void
    {
        $data = $table === 'users'
            ? ['name' => 'Cuenta en conflicto', 'email' => 'conflicto@crm.test', 'password' => 'Temporal-Prueba-123', 'password_confirmation' => 'Temporal-Prueba-123', 'rol' => 'supervisor', 'activo' => '1']
            : ['nombre' => 'Producto en conflicto', 'precio' => '12.50', 'cantidad_minima' => 1, 'activo' => '1'];
        $injected = false;
        // Insertar un duplicado justo después de validar fuerza el error real 1062; no acredita concurrencia.
        DB::connection()->beforeExecuting(function ($query) use ($table, $data, &$injected) {
            if ($injected || ! str_starts_with($query, 'insert into `'.$table.'`')) {
                return;
            }
            $injected = true;
            $row = $data;
            if ($table === 'users') {
                unset($row['password_confirmation']);
                $row['password'] = Hash::make($row['password']);
            }
            DB::table($table)->insert($row);
        });
        $count = DB::table($table)->count();
        $this->actingAs($this->admin())->postJson($path, $data)->assertUnprocessable()
            ->assertJsonPath('errors.'.$field.'.0', $message)->assertDontSee('SQLSTATE', false)->assertDontSee('insert into', false);
        $this->assertTrue($injected);
        $this->assertSame($count, DB::table($table)->count());
    }

    public static function duplicateTables(): array
    {
        return [
            ['users', '/cuentas', 'email', 'Este correo ya está registrado. Ingrese otro.'],
            ['productos', '/productos', 'nombre', 'Este nombre ya está registrado. Ingrese otro.'],
        ];
    }

    public function test_real_sql_error_and_unexpected_exception_never_expose_details_even_in_debug(): void
    {
        config(['app.debug' => true]);
        Route::get('/_prueba-l7-sql', fn () => DB::select('SELECT columna_inexistente_l7 FROM productos'));
        Route::get('/_prueba-l7-error', fn () => throw new \RuntimeException('secreto_sintetico_l7'));
        foreach (['/_prueba-l7-sql', '/_prueba-l7-error'] as $path) {
            $this->get($path)->assertStatus(500)->assertSee('No se pudo completar la solicitud.')
                ->assertDontSee('SQLSTATE', false)->assertDontSee('columna_inexistente_l7', false)
                ->assertDontSee('secreto_sintetico_l7', false)->assertDontSee('Stack trace', false);
            $this->getJson($path)->assertStatus(500)->assertExactJson([
                'message' => 'No se pudo completar la solicitud. Inténtelo de nuevo; si el problema continúa, consulte al administrador.',
            ]);
        }
    }

    public function test_http_json_errors_do_not_expose_debug_traces_or_change_status_and_allow_header(): void
    {
        config(['app.debug' => true]);
        $this->getJson('/ruta-inexistente-l7')->assertNotFound()->assertExactJson([
            'message' => 'El recurso solicitado no está disponible.',
        ]);
        $this->postJson('/reportes')->assertStatus(405)->assertHeader('Allow', 'GET, HEAD')->assertExactJson([
            'message' => 'El método de solicitud no está permitido.',
        ]);
        $this->getJson('/cuentas')->assertUnauthorized()->assertExactJson([
            'message' => 'Inicie sesión para continuar.',
        ]);
    }

    private function admin(): User
    {
        return User::where('email', 'admin@crm.test')->firstOrFail();
    }

    private function keepCookie($response): void
    {
        $this->withCookie(config('session.cookie'), $response->getCookie(config('session.cookie'))->getValue());
    }
}
