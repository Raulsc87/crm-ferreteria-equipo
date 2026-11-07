<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\SeedData;
use Database\Seeders\VerificacionSeeder;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PanelAccountsTest extends TestCase
{
    use DatabaseTransactions;

    private User $admin;

    private User $supervisor;

    private User $seller;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('crm_laravel_test@127.0.0.1', DB::selectOne('SELECT CURRENT_USER() AS account')->account);
        $this->seed(VerificacionSeeder::class);
        $this->admin = User::where('email', 'admin@crm.test')->firstOrFail();
        $this->supervisor = User::where('email', 'sergio@crm.test')->firstOrFail();
        $this->seller = User::where('email', 'valeria@crm.test')->firstOrFail();
    }

    public function test_login_form_is_spanish_and_register_is_unavailable(): void
    {
        $this->get('/login')->assertOk()->assertSee('Correo electrónico')->assertSee('Contraseña')->assertSee('Ingrese al panel');
        $this->get('/register')->assertNotFound();
        $this->post('/register', [])->assertNotFound();
    }

    #[DataProvider('panelRoles')]
    public function test_active_panel_accounts_can_login_and_logout(string $email): void
    {
        $this->get('/login');
        $oldId = session()->getId();
        $login = $this->post('/login', ['email' => $email, 'password' => SeedData::PUBLIC_PASSWORD])->assertRedirect('/dashboard');
        $this->assertAuthenticated();
        $this->assertNotSame($oldId, session()->getId());
        $this->withCookie(config('session.cookie'), $login->getCookie(config('session.cookie'))->getValue());
        Auth::guard('web')->forgetUser();
        $this->get('/dashboard')->assertOk()->assertSee('Cerrar sesión');
        $csrf = session()->token();
        $logout = $this->post('/logout')->assertRedirect('/login');
        $this->assertGuest();
        $this->assertNotSame($csrf, session()->token());
        $this->withCookie(config('session.cookie'), $logout->getCookie(config('session.cookie'))->getValue());
        Auth::guard('web')->forgetUser();
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public static function panelRoles(): array
    {
        return [['admin@crm.test'], ['sergio@crm.test']];
    }

    #[DataProvider('deniedLogins')]
    public function test_denied_login_does_not_create_panel_session(string $email, string $message): void
    {
        $this->from('/login')->post('/login', ['email' => $email, 'password' => SeedData::PUBLIC_PASSWORD])
            ->assertRedirect('/login')->assertSessionHasErrors(['email' => $message])
            ->assertSessionMissing(Auth::guard('web')->getName());
        $this->assertGuest();
    }

    public static function deniedLogins(): array
    {
        return [
            ['valeria@crm.test', 'Debe usar la aplicación del vendedor para ingresar con esta cuenta.'],
            ['ivan@crm.test', 'Su cuenta está desactivada. Consulte al administrador.'],
        ];
    }

    public function test_inactive_admin_and_supervisor_cannot_login(): void
    {
        foreach ([$this->admin, $this->supervisor] as $user) {
            $user->activo = false;
            $user->save();
            $this->post('/login', ['email' => $user->email, 'password' => SeedData::PUBLIC_PASSWORD])
                ->assertSessionHasErrors('email');
            $this->assertGuest();
        }
    }

    public function test_wrong_password_and_unknown_email_return_the_same_error(): void
    {
        foreach (['admin@crm.test', 'unknown@example.test'] as $email) {
            $this->post('/login', ['email' => $email, 'password' => 'Incorrecta-Temporal-123'])
                ->assertSessionHasErrors(['email' => 'El correo o la contraseña no son correctos.']);
            $this->assertGuest();
        }
    }

    #[DataProvider('protectedPaths')]
    public function test_deactivation_invalidates_existing_session_on_each_protected_path(string $method, string $path): void
    {
        $this->post('/login', ['email' => $this->admin->email, 'password' => SeedData::PUBLIC_PASSWORD])->assertRedirect();
        // SQL evita actualizar la instancia que ya conserva el guard.
        DB::table('users')->where('id', $this->admin->id)->update(['activo' => false]);
        $path = str_replace('{id}', (string) $this->seller->id, $path);
        $this->call($method, $path, $this->accountData())->assertRedirect('/login')
            ->assertSessionHasErrors('email')->assertSessionMissing(Auth::guard('web')->getName());
        $this->assertGuest();
        DB::table('users')->where('id', $this->admin->id)->update(['activo' => true]);
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public static function protectedPaths(): array
    {
        return [['GET', '/dashboard'], ['GET', '/cuentas'], ['GET', '/cuentas/create'],
            ['GET', '/cuentas/{id}/edit'], ['POST', '/cuentas'], ['PUT', '/cuentas/{id}'], ['POST', '/logout']];
    }

    public function test_role_change_to_seller_invalidates_session(): void
    {
        $this->post('/login', ['email' => $this->admin->email, 'password' => SeedData::PUBLIC_PASSWORD]);
        DB::table('users')->where('id', $this->admin->id)->update(['rol' => 'vendedor', 'supervisor_id' => $this->supervisor->id]);
        $this->get('/dashboard')->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_admin_changed_to_supervisor_loses_account_permissions_immediately(): void
    {
        $this->post('/login', ['email' => $this->admin->email, 'password' => SeedData::PUBLIC_PASSWORD]);
        DB::table('users')->where('id', $this->admin->id)->update(['rol' => 'supervisor']);
        $this->get('/cuentas')->assertForbidden();
        $this->get('/dashboard')->assertOk()->assertDontSee('Administrar cuentas');
    }

    #[DataProvider('accountOperations')]
    public function test_supervisor_cannot_access_account_operations(string $method, string $path): void
    {
        $this->actingAs($this->supervisor);
        $path = str_replace('{id}', (string) $this->seller->id, $path);
        $before = User::count();
        $this->call($method, $path, $this->accountData())->assertForbidden()->assertSee('Acceso no autorizado');
        $this->assertSame($before, User::count());
        $this->assertSame('Valeria López', $this->seller->fresh()->name);
    }

    public static function accountOperations(): array
    {
        return [['GET', '/cuentas'], ['GET', '/cuentas/create'], ['GET', '/cuentas/{id}/edit'],
            ['POST', '/cuentas'], ['PUT', '/cuentas/{id}'], ['PATCH', '/cuentas/{id}']];
    }

    public function test_guests_and_sellers_cannot_bypass_routes(): void
    {
        $this->get('/cuentas')->assertRedirect('/login');
        $this->post('/cuentas', $this->accountData())->assertRedirect('/login');
        $this->actingAs($this->seller)->get('/cuentas')->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_admin_can_list_create_edit_and_see_no_hashes(): void
    {
        $this->actingAs($this->admin)->get('/cuentas')->assertOk()->assertSee('Alicia Morales')->assertDontSee($this->admin->password, false);
        $this->get('/cuentas/create')->assertOk()->assertSee('Crear cuenta')->assertSee('Sergio Ruiz')->assertSee('Sandra Pérez');
        $this->get('/cuentas/'.$this->seller->id.'/edit')->assertOk()->assertSee('Valeria López')
            ->assertDontSee($this->seller->password, false)->assertDontSee(SeedData::PUBLIC_PASSWORD, false);
        $this->post('/cuentas', $this->accountData())->assertRedirect('/cuentas')->assertSessionHasNoErrors();
        $new = User::where('email', 'nueva@example.test')->firstOrFail();
        $this->assertSame('vendedor', $new->rol);
        $this->assertSame($this->supervisor->id, $new->supervisor_id);
        $this->assertTrue($new->activo);
        $this->assertTrue(Hash::check('Clave-Prueba-123', $new->password));
        $this->assertSame('bcrypt', password_get_info($new->password)['algoName']);
    }

    #[DataProvider('nonSellerRoles')]
    public function test_admin_can_create_accounts_without_supervisor(string $role): void
    {
        $this->actingAs($this->admin)->post('/cuentas', $this->accountData(['rol' => $role, 'supervisor_id' => null]))
            ->assertRedirect('/cuentas')->assertSessionHasNoErrors();
        $new = User::where('email', 'nueva@example.test')->firstOrFail();
        $this->assertSame($role, $new->rol);
        $this->assertNull($new->supervisor_id);
    }

    public static function nonSellerRoles(): array
    {
        return [['administrador'], ['supervisor']];
    }

    public function test_empty_password_preserves_hash_and_new_password_replaces_it(): void
    {
        $hash = $this->seller->password;
        $this->actingAs($this->admin)->put('/cuentas/'.$this->seller->id, $this->accountData([
            'name' => 'Valeria editada', 'email' => $this->seller->email, 'password' => '', 'password_confirmation' => '',
        ]))->assertSessionHasNoErrors()->assertRedirect('/cuentas');
        $this->assertSame($hash, $this->seller->fresh()->password);
        $this->put('/cuentas/'.$this->seller->id, $this->accountData(['email' => $this->seller->email]))
            ->assertSessionHasNoErrors();
        $this->assertTrue(Hash::check('Clave-Prueba-123', $this->seller->fresh()->password));
        $this->assertNotSame($hash, $this->seller->fresh()->password);
    }

    #[DataProvider('invalidData')]
    public function test_invalid_fields_are_rejected_in_spanish(array $changes, string $field): void
    {
        $before = User::count();
        $response = $this->actingAs($this->admin)->from('/cuentas/create')->post('/cuentas', $this->accountData($changes));
        $response->assertRedirect('/cuentas/create')->assertSessionHasErrors($field);
        $message = session('errors')->first($field);
        $this->assertSame($before, User::count());
        $this->withCookie(config('session.cookie'), $response->getCookie(config('session.cookie'))->getValue());
        $page = $this->get('/cuentas/create')->assertOk();
        $this->assertTrue(str_contains($page->getContent(), 'Revise los campos indicados'));
        $page->assertSee($message);
        $page->assertDontSee('Clave-Prueba-123', false);
    }

    public static function invalidData(): array
    {
        return [
            [['name' => ''], 'name'], [['email' => 'incorrecto'], 'email'], [['email' => 'ADMIN@CRM.TEST'], 'email'],
            [['password' => '', 'password_confirmation' => ''], 'password'],
            [['password' => 'corta', 'password_confirmation' => 'corta'], 'password'],
            [['password_confirmation' => 'diferente'], 'password'],
            [['rol' => 'inexistente'], 'rol'], [['activo' => 'incorrecto'], 'activo'],
            [['supervisor_id' => null], 'supervisor_id'], [['supervisor_id' => 999999999], 'supervisor_id'],
            [['rol' => 'administrador'], 'supervisor_id'],
        ];
    }

    public function test_supervisor_must_be_active_have_correct_role_and_not_be_self(): void
    {
        $this->actingAs($this->admin);
        $this->post('/cuentas', $this->accountData(['supervisor_id' => $this->seller->id]))->assertSessionHasErrors('supervisor_id');
        $this->supervisor->update(['activo' => false]);
        $this->post('/cuentas', $this->accountData())->assertSessionHasErrors('supervisor_id');
        // Un supervisor sin equipo tampoco puede convertirse en su propio supervisor.
        $empty = User::create(['name' => 'Sin equipo', 'email' => 'empty@example.test', 'rol' => 'supervisor', 'activo' => true, 'password' => 'Temporal-123']);
        $this->put('/cuentas/'.$empty->id, $this->accountData(['email' => $empty->email, 'supervisor_id' => $empty->id]))
            ->assertSessionHasErrors('supervisor_id');
        $this->assertSame('supervisor', $empty->fresh()->rol);
    }

    public function test_supervisor_role_cannot_change_with_assigned_sellers_including_inactive(): void
    {
        $this->actingAs($this->admin)->put('/cuentas/'.$this->supervisor->id,
            $this->accountData(['email' => $this->supervisor->email, 'rol' => 'administrador', 'supervisor_id' => null]))
            ->assertSessionHasErrors('rol');
        $this->assertSame('supervisor', $this->supervisor->fresh()->rol);
        DB::table('users')->where('supervisor_id', $this->supervisor->id)->update(['activo' => false]);
        $this->put('/cuentas/'.$this->supervisor->id,
            $this->accountData(['email' => $this->supervisor->email, 'rol' => 'administrador', 'supervisor_id' => null]))
            ->assertSessionHasErrors('rol');
    }

    public function test_deactivating_supervisor_preserves_associations_and_business_data(): void
    {
        $before = $this->businessSnapshot();
        $members = User::where('supervisor_id', $this->supervisor->id)->pluck('id')->all();
        $this->actingAs($this->admin)->put('/cuentas/'.$this->supervisor->id, $this->accountData([
            'email' => $this->supervisor->email, 'rol' => 'supervisor', 'supervisor_id' => null, 'activo' => '0',
        ]))->assertSessionHasNoErrors();
        $this->assertFalse($this->supervisor->fresh()->activo);
        $this->assertSame($members, User::where('supervisor_id', $this->supervisor->id)->pluck('id')->all());
        $this->assertSame($before, $this->businessSnapshot());
    }

    public function test_reassignment_and_seller_deactivation_preserve_clients_and_history(): void
    {
        $before = $this->businessSnapshot();
        $sandra = User::where('email', 'sandra@crm.test')->firstOrFail();
        $this->actingAs($this->admin)->put('/cuentas/'.$this->seller->id, $this->accountData([
            'email' => $this->seller->email, 'supervisor_id' => $sandra->id, 'activo' => '0',
        ]))->assertSessionHasNoErrors();
        $this->assertSame($sandra->id, $this->seller->fresh()->supervisor_id);
        $this->assertFalse($this->seller->fresh()->activo);
        $this->assertSame($before, $this->businessSnapshot());
    }

    public function test_supervisor_can_change_role_after_every_seller_is_reassigned(): void
    {
        $sandra = User::where('email', 'sandra@crm.test')->firstOrFail();
        $this->actingAs($this->admin);
        foreach (User::where('supervisor_id', $this->supervisor->id)->get() as $seller) {
            $this->put('/cuentas/'.$seller->id, $this->accountData(['email' => $seller->email, 'supervisor_id' => $sandra->id]))
                ->assertSessionHasNoErrors();
        }
        $this->put('/cuentas/'.$this->supervisor->id, $this->accountData([
            'email' => $this->supervisor->email, 'rol' => 'administrador', 'supervisor_id' => null,
        ]))->assertSessionHasNoErrors();
        $this->assertSame('administrador', $this->supervisor->fresh()->rol);
    }

    public function test_admin_cannot_disable_or_remove_own_role(): void
    {
        $this->actingAs($this->admin);
        $self = $this->accountData(['email' => $this->admin->email, 'rol' => 'administrador', 'supervisor_id' => null]);
        $this->put('/cuentas/'.$this->admin->id, array_replace($self, ['activo' => '0']))->assertSessionHasErrors('activo');
        $this->assertTrue($this->admin->fresh()->activo);
        $this->put('/cuentas/'.$this->admin->id, array_replace($self, ['rol' => 'supervisor']))->assertSessionHasErrors('rol');
        $this->assertSame('administrador', $this->admin->fresh()->rol);
        $this->put('/cuentas/'.$this->admin->id, $self)->assertSessionHasNoErrors();
    }

    public function test_fields_are_escaped_and_passwords_never_flash_back(): void
    {
        $name = '<script>alert(1)</script>';
        $this->actingAs($this->admin)->from('/cuentas/create')->post('/cuentas', $this->accountData(['name' => $name, 'email' => 'invalid']))
            ->assertSessionHasErrors('email')->assertSessionHasInput('name', $name)
            ->assertSessionMissing('_old_input.password')->assertSessionMissing('_old_input.password_confirmation');
        $this->get('/cuentas/create')->assertSee(e($name), false)->assertDontSee($name, false)->assertDontSee('Clave-Prueba-123', false);
    }

    public function test_delete_and_self_service_routes_do_not_exist(): void
    {
        $before = User::count();
        $this->actingAs($this->admin)->delete('/cuentas/'.$this->seller->id)->assertStatus(405);
        $this->get('/profile')->assertNotFound();
        $this->patch('/profile', ['rol' => 'administrador'])->assertNotFound();
        $this->put('/password', [])->assertNotFound();
        $this->assertSame($before, User::count());
    }

    public function test_csrf_is_required_for_account_writes(): void
    {
        $middleware = new class($this->app, $this->app->make('encrypter')) extends PreventRequestForgery
        {
            protected function runningUnitTests()
            {
                return false;
            }
        };
        $this->app->instance(PreventRequestForgery::class, $middleware);
        $before = User::count();
        $this->actingAs($this->admin)->post('/cuentas', $this->accountData())->assertStatus(419);
        $this->assertSame($before, User::count());
        $page = $this->get('/cuentas/create')->assertOk();
        $this->withCookie(config('session.cookie'), $page->getCookie(config('session.cookie'))->getValue());
        $this->post('/cuentas', $this->accountData(['_token' => session()->token()]))->assertRedirect('/cuentas')->assertSessionHasNoErrors();
        $this->assertSame($before + 1, User::count());
    }

    private function accountData(array $changes = []): array
    {
        return array_replace([
            'name' => 'Cuenta de prueba', 'email' => 'nueva@example.test',
            'password' => 'Clave-Prueba-123', 'password_confirmation' => 'Clave-Prueba-123',
            'rol' => 'vendedor', 'supervisor_id' => $this->supervisor->id, 'activo' => '1',
        ], $changes);
    }

    private function businessSnapshot(): string
    {
        $rows = [];
        foreach (array_diff(SeedData::TABLES, ['users']) as $table) {
            $rows[$table] = DB::table($table)->orderBy('id')->get();
        }

        return hash('sha256', json_encode($rows));
    }
}
