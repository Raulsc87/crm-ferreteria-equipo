<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use App\Support\ClientIdentity;
use Database\Seeders\VerificacionSeeder;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ClientManagementTest extends TestCase
{
    use DatabaseTransactions;

    private User $admin;

    private User $supervisor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('crm_laravel_test@127.0.0.1', DB::selectOne('SELECT CURRENT_USER() AS account')->account);
        $this->seed(VerificacionSeeder::class);
        $this->admin = User::where('email', 'admin@crm.test')->firstOrFail();
        $this->supervisor = User::where('email', 'sergio@crm.test')->firstOrFail();
    }

    public function test_lists_have_correct_scope_and_only_identification_for_available_clients(): void
    {
        $this->actingAs($this->admin)->get('/clientes')->assertOk()->assertViewHas('clients', fn ($c) => $c->count() === 21);
        $this->actingAs($this->supervisor)->get('/clientes')->assertOk()->assertSee('Comercial El Quetzal')
            ->assertDontSee('Abarrotes San Juan')->assertDontSee('Hotel Los Pinos')
            ->assertViewHas('clients', fn ($c) => $c->count() === 11);
        $this->get('/clientes?sin_asignar=1')->assertOk()->assertSee('Clínica San Rafael')
            ->assertDontSee('77672003')->assertDontSee('8889990K')
            ->assertViewHas('clients', fn ($c) => $c->count() === 6 && $c->every(fn ($i) => $i->vendedor_id === null));
        $this->get('/dashboard')->assertOk()->assertSee('Clientes');
    }

    public function test_search_and_filters_do_not_escape_scope(): void
    {
        $this->actingAs($this->supervisor);
        $this->get('/clientes?'.http_build_query(['q' => '452 1817-k']))->assertOk()
            ->assertViewHas('clients', fn ($c) => $c->count() === 1 && $c->first()->nombre === 'Comercial El Quetzal');
        $this->get('/clientes?q=Altos')->assertOk()->assertSee('Farmacia Los Altos');
        $this->get('/clientes?q=San')->assertOk()->assertDontSee('Abarrotes San Juan');
        $diego = $this->user('diego');
        $this->get('/clientes?vendedor_id='.$diego->id)->assertOk()->assertViewHas('clients', fn ($c) => $c->count() === 2);
        $this->get('/clientes?vendedor_id='.$this->user('carlos')->id)->assertNotFound();
        $this->get('/clientes?q=CF')->assertOk()->assertViewHas('clients', fn ($c) => $c->isNotEmpty() && $c->every(fn ($i) => $i->nit === null));
        foreach (['%', "' OR 1=1 --"] as $query) {
            $this->get('/clientes?'.http_build_query(['q' => $query]))->assertOk()->assertViewHas('clients', fn ($c) => $c->isEmpty());
        }
        $this->getJson('/clientes?vendedor_id='.$diego->id.'&sin_asignar=1')->assertUnprocessable()->assertJsonValidationErrors('vendedor_id');
    }

    #[DataProvider('resourceOperations')]
    public function test_foreign_resources_are_404_before_validation(string $method, string $suffix): void
    {
        $foreign = $this->client('Abarrotes San Juan');
        $this->actingAs($this->supervisor)->call($method, '/clientes/'.$foreign->id.$suffix, ['nombre' => ''])
            ->assertNotFound();
        $this->assertSame('Abarrotes San Juan', $foreign->fresh()->nombre);
    }

    public static function resourceOperations(): array
    {
        return [['GET', '/edit'], ['PUT', ''], ['PATCH', ''], ['GET', '/asignacion'], ['PATCH', '/asignacion'],
            ['GET', '/liberar'], ['POST', '/liberar'], ['GET', '/eliminar'], ['DELETE', '']];
    }

    public function test_normalization_and_modulo_eleven_match_enunciado(): void
    {
        $client = $this->client('Comercial El Quetzal');
        $this->actingAs($this->supervisor)->put('/clientes/'.$client->id, $this->data([
            'nombre' => '  Comercial   El Quetzal  ', 'nit' => ' 000452 1817-k ',
            'telefono' => '+502 (5555)-1234', 'correo' => 'compras@elquetzal.test',
        ]))->assertSessionHasNoErrors()->assertRedirect('/clientes');
        $this->assertSame(['Comercial El Quetzal', '4521817K', '55551234'], [$client->fresh()->nombre, $client->fresh()->nit, $client->fresh()->telefono]);
        $this->assertTrue(ClientIdentity::validNit('4521817K'));
        $this->assertFalse(ClientIdentity::validNit('45218170'));
        $this->assertSame('50211234', ClientIdentity::phone('50211234'));
        $this->assertSame('55551234', ClientIdentity::phone('502 5555.1234'));
    }

    public function test_multiple_cf_and_available_creation_and_edit_are_allowed(): void
    {
        $this->actingAs($this->supervisor);
        foreach (['CF', ' c-f ', ''] as $i => $nit) {
            $this->post('/clientes', $this->data(['nit' => $nit, 'telefono' => '5900010'.($i + 1)]))
                ->assertSessionHasNoErrors()->assertRedirect('/clientes');
        }
        $created = Client::where('nombre', 'Cliente temporal')->get();
        $this->assertCount(3, $created);
        $this->assertTrue($created->every(fn ($c) => $c->nit === null && $c->vendedor_id === null));
        $this->put('/clientes/'.$created->first()->id, $this->data(['nombre' => 'Editado', 'nit' => null, 'telefono' => '59000101']))
            ->assertSessionHasNoErrors();
        $this->assertSame('Editado', $created->first()->fresh()->nombre);
    }

    public function test_duplicate_nit_and_phone_are_checked_after_normalization(): void
    {
        $this->actingAs($this->admin)->postJson('/clientes', $this->data(['nit' => '0004521817-k']))
            ->assertUnprocessable()->assertJsonValidationErrors('nit');
        $this->postJson('/clientes', $this->data(['telefono' => '+502 5555-1234']))
            ->assertUnprocessable()->assertJsonValidationErrors('telefono');
        $other = $this->client('Luis Tzul');
        $this->putJson('/clientes/'.$other->id, $this->data(['nit' => '452 1817-k']))
            ->assertUnprocessable()->assertJsonValidationErrors('nit');
        $this->assertNull($other->fresh()->nit);
    }

    public function test_valid_name_email_and_short_nit_boundaries(): void
    {
        $email = str_repeat('a', 64).'@'.str_repeat('b', 40).'.'.str_repeat('c', 39).'.test';
        $this->assertSame(150, strlen($email));
        $this->actingAs($this->admin)->post('/clientes', $this->data([
            'nombre' => str_repeat('á', 150), 'nit' => '19', 'telefono' => '+502.(5900)-0999', 'correo' => $email,
        ]))->assertSessionHasNoErrors()->assertRedirect('/clientes');
        $created = Client::where('telefono', '59000999')->firstOrFail();
        $this->assertSame('19', $created->nit);
        $this->assertSame($email, $created->correo);
        $this->assertSame(150, mb_strlen($created->nombre));
    }

    #[DataProvider('invalidFields')]
    public function test_invalid_identity_fields_are_rejected_without_writes(array $change, string $field): void
    {
        $client = $this->client('María Coyoy');
        $before = $client->getAttributes();
        $this->actingAs($this->admin)->postJson('/clientes', $this->data($change))->assertUnprocessable()->assertJsonValidationErrors($field);
        $this->putJson('/clientes/'.$client->id, $this->data($change))->assertUnprocessable()->assertJsonValidationErrors($field);
        $this->assertSame($before, $client->fresh()->getAttributes());
        $this->assertSame(21, Client::count());
    }

    public static function invalidFields(): array
    {
        return [
            [['nombre' => ' '], 'nombre'], [['nombre' => str_repeat('a', 151)], 'nombre'], [['nombre' => []], 'nombre'],
            [['nit' => '45218170'], 'nit'], [['nit' => '000000'], 'nit'], [['nit' => 'K'], 'nit'],
            [['nit' => '1234567890123'], 'nit'], [['nit' => 'ABC123'], 'nit'], [['nit' => []], 'nit'],
            [['telefono' => '12345678'], 'telefono'], [['telefono' => '01234567'], 'telefono'],
            [['telefono' => '5900001'], 'telefono'], [['telefono' => '590000111'], 'telefono'],
            [['telefono' => '+503 59000111'], 'telefono'], [['telefono' => '59000ABC'], 'telefono'], [['telefono' => null], 'telefono'],
            [['correo' => 'incorrecto'], 'correo'], [['correo' => str_repeat('a', 145).'@x.test'], 'correo'],
        ];
    }

    public function test_assignment_only_accepts_active_sellers_in_own_team_and_respects_capacity(): void
    {
        $pool = $this->client('Agencia Cuatro Caminos');
        $this->actingAs($this->supervisor)->get('/clientes/'.$pool->id.'/asignacion')->assertOk()
            ->assertSee('Valeria López')->assertDontSee('Carlos Ajú')->assertDontSee('Iván Toj');
        $this->patchJson('/clientes/'.$pool->id.'/asignacion', $this->action($pool, ['vendedor_id' => $this->user('carlos')->id]))->assertNotFound();
        $this->patchJson('/clientes/'.$pool->id.'/asignacion', $this->action($pool, ['vendedor_id' => $this->supervisor->id]))->assertUnprocessable()->assertJsonValidationErrors('vendedor_id');
        $this->actingAs($this->admin)->patchJson('/clientes/'.$pool->id.'/asignacion', $this->action($pool, ['vendedor_id' => $this->user('ivan')->id]))
            ->assertUnprocessable()->assertJsonValidationErrors('vendedor_id');
        $carlos = $this->user('carlos');
        $this->patch('/clientes/'.$pool->id.'/asignacion', $this->action($pool, ['vendedor_id' => $carlos->id]))->assertSessionHasNoErrors();
        $this->assertSame(10, Client::where('vendedor_id', $carlos->id)->count());
        $second = $this->client('Café Zunil');
        $this->patchJson('/clientes/'.$second->id.'/asignacion', $this->action($second, ['vendedor_id' => $carlos->id]))
            ->assertStatus(409)->assertJsonValidationErrors('vendedor_id');
        $this->postJson('/clientes', $this->data(['vendedor_id' => $carlos->id]))->assertStatus(409)->assertJsonValidationErrors('vendedor_id');
        $this->assertNull($second->fresh()->vendedor_id);
        $this->assertSame(10, Client::where('vendedor_id', $carlos->id)->count());
    }

    public function test_create_can_assign_only_a_permitted_seller(): void
    {
        $this->actingAs($this->supervisor)->postJson('/clientes', $this->data(['vendedor_id' => $this->user('carlos')->id]))->assertNotFound();
        $this->post('/clientes', $this->data(['vendedor_id' => $this->user('diego')->id]))->assertSessionHasNoErrors();
        $this->assertSame($this->user('diego')->id, Client::where('telefono', '59000111')->firstOrFail()->vendedor_id);
    }

    public function test_reassignment_transfers_only_open_opportunities_and_preserves_history_and_activity_author(): void
    {
        $client = $this->client('Comercial El Quetzal');
        $history = $this->snapshot('historial_etapas');
        $lines = $this->snapshot('oportunidad_productos');
        $activities = $this->snapshot('actividades');
        $won = DB::table('oportunidades')->where('titulo', 'Renovación de planes')->first();
        $diego = $this->user('diego');
        $this->actingAs($this->supervisor)->patch('/clientes/'.$client->id.'/asignacion', $this->action($client, ['vendedor_id' => $diego->id]))
            ->assertSessionHasNoErrors();
        $this->assertSame($diego->id, $client->fresh()->vendedor_id);
        $this->assertSame($diego->id, DB::table('oportunidades')->where('titulo', 'Ampliación a bodega')->value('vendedor_id'));
        $this->assertSame($diego->id, DB::table('oportunidades')->where('titulo', 'Seguimiento anual')->value('vendedor_id'));
        $this->assertSame((array) $won, (array) DB::table('oportunidades')->where('id', $won->id)->first());
        $this->assertSame($history, $this->snapshot('historial_etapas'));
        $this->assertSame($lines, $this->snapshot('oportunidad_productos'));
        $this->assertSame($activities, $this->snapshot('actividades'));
        // Un administrador puede transferir a otro equipo; el antiguo supervisor pierde la ficha.
        $this->actingAs($this->admin)->patch('/clientes/'.$client->id.'/asignacion', $this->action($client->fresh(), ['vendedor_id' => $this->user('carlos')->id]))
            ->assertSessionHasNoErrors();
        $this->actingAs($this->supervisor)->get('/clientes/'.$client->id.'/edit')->assertNotFound();
    }

    public function test_release_checks_open_opportunities_and_pending_activities_and_preserves_closed_data(): void
    {
        $this->actingAs($this->supervisor);
        foreach (['Comercial El Quetzal', 'María Coyoy'] as $name) {
            $client = $this->client($name);
            $this->postJson('/clientes/'.$client->id.'/liberar', $this->action($client))->assertStatus(409)->assertJsonValidationErrors('asignacion');
            $this->assertNotNull($client->fresh()->vendedor_id);
        }
        $client = $this->client('Ferretería Xela');
        DB::table('oportunidades')->where('cliente_id', $client->id)->where('etapa', 'propuesta')->update([
            'etapa' => 'perdida', 'fecha_cierre' => '2026-11-04 12:00:00', 'motivo_perdida' => 'Cierre temporal de prueba',
        ]);
        DB::table('actividades')->where('cliente_id', $client->id)->update(['completada' => true]);
        $opportunities = $this->snapshot('oportunidades');
        $activities = $this->snapshot('actividades');
        $this->post('/clientes/'.$client->id.'/liberar', $this->action($client))->assertSessionHasNoErrors();
        $this->assertNull($client->fresh()->vendedor_id);
        $this->assertSame($opportunities, $this->snapshot('oportunidades'));
        $this->assertSame($activities, $this->snapshot('actividades'));
    }

    public function test_stale_assignment_and_unconfirmed_actions_do_not_write(): void
    {
        $pool = $this->client('Café Zunil');
        $url = '/clientes/'.$pool->id.'/asignacion';
        $this->actingAs($this->supervisor)->patchJson($url, ['vendedor_id' => $this->user('diego')->id, 'expected_vendedor_id' => null])
            ->assertUnprocessable()->assertJsonValidationErrors('confirmar');
        $this->patch($url, $this->action($pool, ['vendedor_id' => $this->user('diego')->id]))->assertSessionHasNoErrors();
        $this->patchJson($url, $this->action($pool, ['vendedor_id' => $this->user('valeria')->id]))
            ->assertStatus(409)->assertJsonValidationErrors('asignacion');
        $this->assertSame($this->user('diego')->id, $pool->fresh()->vendedor_id);
    }

    public function test_edit_cannot_bypass_assignment_or_release_using_extra_owner_field(): void
    {
        $client = $this->client('Comercial El Quetzal');
        $this->actingAs($this->admin)->putJson('/clientes/'.$client->id, $this->data(['vendedor_id' => null]))
            ->assertUnprocessable()->assertJsonValidationErrors('vendedor_id');
        $this->assertSame($this->user('valeria')->id, $client->fresh()->vendedor_id);
    }

    public function test_only_admin_can_delete_and_only_without_any_opportunity_with_activity_cascade(): void
    {
        $client = $this->client('Pedro Batz'); // sin oportunidades
        $activity = DB::table('actividades')->insertGetId([
            'cliente_id' => $client->id, 'vendedor_id' => $this->user('carlos')->id, 'tipo' => 'tarea', 'descripcion' => 'Temporal', 'completada' => false,
        ]);
        $sandra = $this->user('sandra');
        $this->actingAs($sandra)->get('/clientes/'.$client->id.'/eliminar')->assertForbidden();
        $this->deleteJson('/clientes/'.$client->id, $this->action($client))->assertForbidden();
        $this->actingAs($this->admin)->get('/clientes/'.$client->id.'/eliminar')->assertOk()->assertSee('sus actividades');
        $this->deleteJson('/clientes/'.$client->id, ['expected_vendedor_id' => $client->vendedor_id])
            ->assertUnprocessable()->assertJsonValidationErrors('confirmar');
        $this->delete('/clientes/'.$client->id, $this->action($client))->assertRedirect('/clientes')->assertSessionHasNoErrors();
        $this->assertNull($client->fresh());
        $this->assertFalse(DB::table('actividades')->where('id', $activity)->exists());
        $withWon = $this->client('Abarrotes San Juan');
        $this->deleteJson('/clientes/'.$withWon->id, $this->action($withWon))->assertStatus(409)->assertJsonValidationErrors('asignacion');
        $this->assertNotNull($withWon->fresh());
    }

    public function test_validation_preserves_data_and_escapes_text_and_cf_is_displayed(): void
    {
        $name = '<script>alert(1)</script>';
        $r = $this->actingAs($this->supervisor)->from('/clientes/create')->post('/clientes', $this->data(['nombre' => $name, 'telefono' => 'incorrecto']));
        $r->assertSessionHasErrors('telefono')->assertSessionHasInput('nombre', $name);
        $this->withCookie(config('session.cookie'), $r->getCookie(config('session.cookie'))->getValue());
        $this->get('/clientes/create')->assertOk()->assertSee('Revise los campos indicados')->assertSee('Ingrese ocho dígitos')
            ->assertSee(e($name), false)->assertDontSee($name, false);
        $this->get('/clientes/'.$this->client('María Coyoy')->id.'/edit')->assertOk()->assertSee('value="CF"', false);
    }

    public function test_guests_sellers_inactive_and_changed_scope_are_blocked(): void
    {
        $this->get('/clientes')->assertRedirect('/login');
        $this->post('/clientes', $this->data())->assertRedirect('/login');
        $this->actingAs($this->user('valeria'))->get('/clientes')->assertRedirect('/login');
        $this->assertGuest();
        $this->admin->update(['activo' => false]);
        $this->actingAs($this->admin)->post('/clientes', $this->data())->assertRedirect('/login');
        $this->admin->update(['activo' => true]);
        $this->actingAs($this->admin);
        DB::table('users')->where('id', $this->admin->id)->update(['rol' => 'supervisor']);
        $this->get('/clientes/'.$this->client('Comercial El Quetzal')->id.'/edit')->assertNotFound();
    }

    public function test_csrf_is_required_for_client_writes(): void
    {
        $middleware = new class($this->app, $this->app->make('encrypter')) extends PreventRequestForgery
        {
            protected function runningUnitTests()
            {
                return false;
            }
        };
        $this->app->instance(PreventRequestForgery::class, $middleware);
        $this->actingAs($this->admin)->post('/clientes', $this->data())->assertStatus(419);
        $this->assertSame(21, Client::count());
    }

    private function data(array $changes = []): array
    {
        return array_replace(['nombre' => 'Cliente temporal', 'nit' => 'CF', 'telefono' => '59000111', 'correo' => null], $changes);
    }

    private function action(Client $client, array $changes = []): array
    {
        return array_replace(['confirmar' => '1', 'expected_vendedor_id' => $client->vendedor_id], $changes);
    }

    private function user(string $name): User
    {
        return User::where('email', $name.'@crm.test')->firstOrFail();
    }

    private function client(string $name): Client
    {
        return Client::where('nombre', $name)->firstOrFail();
    }

    private function snapshot(string $table): string
    {
        return hash('sha256', json_encode(DB::table($table)->orderBy('id')->get()));
    }
}
