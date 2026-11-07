<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Database\Seeders\SeedData;
use Database\Seeders\VerificacionSeeder;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\SeedControlQueries;
use Tests\TestCase;

class ProductCatalogTest extends TestCase
{
    use DatabaseTransactions;

    private User $admin;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('crm_laravel_test@127.0.0.1', DB::selectOne('SELECT CURRENT_USER() AS account')->account);
        $this->seed(VerificacionSeeder::class);
        $this->admin = User::where('email', 'admin@crm.test')->firstOrFail();
        $this->product = Product::where('nombre', 'Plan avanzado')->firstOrFail();
    }

    public function test_admin_sees_catalog_forms_and_menu_link_with_minimum_one(): void
    {
        $this->actingAs($this->admin)->get('/dashboard')->assertOk()->assertSee('Productos');
        $this->get('/productos')->assertOk()->assertSee('Plan avanzado')->assertSee('Q2750.50')->assertSee('Licencia anterior')->assertSee('Inactivo');
        $new = new Product;
        $this->assertSame(1, $new->cantidad_minima);
        $this->assertTrue($new->activo);
        $form = $this->get('/productos/create')->assertOk()->assertSee('Agregar producto');
        $this->assertMatchesRegularExpression('/<input\b(?=[^>]*\bname="cantidad_minima")(?=[^>]*\bvalue="1")[^>]*>/', $form->getContent());
        $this->get('/productos/'.$this->product->id.'/edit')->assertOk()->assertSee('Editar producto')->assertSee('2750.50');
    }

    public function test_create_normalizes_whitespace_and_stores_decimal_without_changing_other_data(): void
    {
        $before = $this->otherDataSnapshot();
        $this->actingAs($this->admin)->post('/productos', $this->data(['nombre' => "  Tornillo \t galvanizado  "]))
            ->assertSessionHasNoErrors()->assertRedirect('/productos')->assertSessionHas('status', 'Producto creado correctamente.');
        $product = Product::where('nombre', 'Tornillo galvanizado')->firstOrFail();
        $this->assertSame('25.50', $product->precio);
        $this->assertSame(1, $product->cantidad_minima);
        $this->assertTrue($product->activo);
        $this->assertSame($before, $this->otherDataSnapshot());
    }

    #[DataProvider('validPrices')]
    public function test_accepts_price_boundaries_and_zero_one_or_two_decimal_places(string $price, string $stored): void
    {
        $this->actingAs($this->admin)->post('/productos', $this->data(['precio' => $price]))->assertSessionHasNoErrors()->assertRedirect('/productos');
        $this->assertSame($stored, Product::where('nombre', 'Producto de prueba')->firstOrFail()->precio);
    }

    public static function validPrices(): array
    {
        return [['0.01', '0.01'], ['1', '1.00'], ['1.5', '1.50'], ['99999999.99', '99999999.99'], ['0000000001.99', '1.99']];
    }

    public function test_name_length_and_quantity_boundaries_are_accepted(): void
    {
        $this->actingAs($this->admin)->post('/productos', $this->data(['nombre' => str_repeat('á', 120), 'cantidad_minima' => 999]))
            ->assertSessionHasNoErrors();
        $created = Product::where('nombre', str_repeat('á', 120))->firstOrFail();
        $this->assertSame(999, $created->cantidad_minima);
        $this->put('/productos/'.$created->id, $this->data(['nombre' => $created->nombre, 'cantidad_minima' => 1]))
            ->assertSessionHasNoErrors();
        $this->assertSame(1, $created->fresh()->cantidad_minima);
    }

    public function test_edit_can_keep_own_name_and_change_price_and_minimum(): void
    {
        $this->actingAs($this->admin)->put('/productos/'.$this->product->id, $this->data([
            'nombre' => ' Plan avanzado ', 'precio' => '3000.75', 'cantidad_minima' => 50,
        ]))->assertSessionHasNoErrors()->assertRedirect('/productos');
        $this->assertSame(['Plan avanzado', '3000.75', 50], [$this->product->fresh()->nombre, $this->product->fresh()->precio, $this->product->fresh()->cantidad_minima]);
    }

    public function test_activation_and_deactivation_preserve_product_and_all_quoted_data(): void
    {
        $before = $this->otherDataSnapshot();
        $controls = SeedControlQueries::controls();
        $products = Product::count();
        $this->actingAs($this->admin);
        foreach (['0', '1'] as $state) {
            $this->patch('/productos/'.$this->product->id, $this->data([
                'nombre' => $this->product->nombre, 'precio' => '99999999.99', 'cantidad_minima' => 999, 'activo' => $state,
                'oportunidad_productos' => [['precio_unitario' => '0.01', 'cantidad' => 999]],
            ]))->assertSessionHasNoErrors()->assertRedirect('/productos');
            $this->assertSame($state === '1', $this->product->fresh()->activo);
            $this->assertSame($products, Product::count());
            $this->assertSame($before, $this->otherDataSnapshot());
            $this->assertSame($controls, SeedControlQueries::controls());
            $this->assertSame([
                ['Instalación', 1, '450.00'], ['Plan avanzado', 2, '5200.00'],
                ['Plan básico', 5, '6000.00'], ['Soporte anual', 3, '10800.00'],
            ], SeedControlQueries::productSales());
        }
        $line = DB::table('oportunidad_productos as l')->join('oportunidades as o', 'o.id', '=', 'l.oportunidad_id')
            ->where('o.titulo', 'Renovación de planes')->where('l.producto_id', $this->product->id)->first(['l.precio_unitario', 'l.cantidad']);
        $this->assertSame(['2600.00', 2], [$line->precio_unitario, $line->cantidad]);
    }

    public function test_duplicate_names_are_rejected_after_whitespace_and_case_normalization(): void
    {
        $this->actingAs($this->admin)->post('/productos', $this->data(['nombre' => '  Plan   avanzado ']))->assertSessionHasErrors('nombre');
        $this->post('/productos', $this->data(['nombre' => 'PLAN AVANZADO']))->assertSessionHasErrors('nombre');
        $before = $this->product->getAttributes();
        $this->put('/productos/'.$this->product->id, $this->data(['nombre' => ' Plan básico ']))->assertSessionHasErrors('nombre');
        $this->assertSame($before, $this->product->fresh()->getAttributes());
        $this->assertSame(5, Product::count());
    }

    #[DataProvider('invalidFields')]
    public function test_invalid_input_is_rejected_on_both_create_and_edit(array $changes, string $field): void
    {
        $this->actingAs($this->admin);
        $before = $this->product->getAttributes();
        $this->post('/productos', $this->data($changes))->assertSessionHasErrors($field);
        $this->assertSame(5, Product::count());
        $this->put('/productos/'.$this->product->id, $this->data($changes))->assertSessionHasErrors($field);
        $this->assertSame($before, $this->product->fresh()->getAttributes());
    }

    public static function invalidFields(): array
    {
        return [
            'nombre vacío' => [['nombre' => ''], 'nombre'],
            'nombre espacios' => [['nombre' => " \t "], 'nombre'],
            'nombre largo' => [['nombre' => str_repeat('a', 121)], 'nombre'],
            'nombre arreglo' => [['nombre' => ['incorrecto']], 'nombre'],
            'precio vacío' => [['precio' => ''], 'precio'],
            'precio cero' => [['precio' => '0.00'], 'precio'],
            'precio negativo' => [['precio' => '-0.01'], 'precio'],
            'precio excesivo' => [['precio' => '100000000.00'], 'precio'],
            'precio tres decimales' => [['precio' => '1.001'], 'precio'],
            'precio redondeable' => [['precio' => '99999999.999'], 'precio'],
            'precio exponente' => [['precio' => '1e2'], 'precio'],
            'precio coma' => [['precio' => '1,50'], 'precio'],
            'precio no numérico' => [['precio' => 'abc'], 'precio'],
            'precio arreglo' => [['precio' => ['1.00']], 'precio'],
            'precio booleano' => [['precio' => true], 'precio'],
            'mínimo nulo' => [['cantidad_minima' => null], 'cantidad_minima'],
            'mínimo cero' => [['cantidad_minima' => 0], 'cantidad_minima'],
            'mínimo negativo' => [['cantidad_minima' => -1], 'cantidad_minima'],
            'mínimo excesivo' => [['cantidad_minima' => 1000], 'cantidad_minima'],
            'mínimo fracción' => [['cantidad_minima' => '1.5'], 'cantidad_minima'],
            'mínimo no numérico' => [['cantidad_minima' => 'abc'], 'cantidad_minima'],
            'estado nulo' => [['activo' => null], 'activo'],
            'estado texto' => [['activo' => 'activo'], 'activo'],
            'estado fuera de rango' => [['activo' => 2], 'activo'],
        ];
    }

    #[DataProvider('operations')]
    public function test_supervisor_cannot_access_any_product_operation(string $method, string $path): void
    {
        $this->actingAs(User::where('email', 'sergio@crm.test')->firstOrFail())->get('/dashboard')->assertOk()->assertDontSee('Productos');
        $before = $this->product->getAttributes();
        $this->call($method, str_replace('{id}', (string) $this->product->id, $path), $this->data())
            ->assertForbidden()->assertSee('Usted no tiene permiso para realizar esta operación.');
        $this->assertSame(5, Product::count());
        $this->assertSame($before, $this->product->fresh()->getAttributes());
    }

    #[DataProvider('operations')]
    public function test_guest_cannot_access_any_product_operation(string $method, string $path): void
    {
        $this->call($method, str_replace('{id}', (string) $this->product->id, $path), $this->data())->assertRedirect('/login');
        $this->assertSame(5, Product::count());
    }

    public static function operations(): array
    {
        return [['GET', '/productos'], ['GET', '/productos/create'], ['GET', '/productos/{id}/edit'],
            ['POST', '/productos'], ['PUT', '/productos/{id}'], ['PATCH', '/productos/{id}']];
    }

    public function test_inactive_admin_and_seller_sessions_cannot_access_catalog(): void
    {
        $this->admin->update(['activo' => false]);
        $this->actingAs($this->admin)->post('/productos', $this->data())->assertRedirect('/login');
        $this->assertGuest();
        $this->actingAs(User::where('email', 'valeria@crm.test')->firstOrFail())
            ->put('/productos/'.$this->product->id, $this->data())->assertRedirect('/login');
        $this->assertGuest();
        $this->assertSame(5, Product::count());
    }

    public function test_permissions_are_rechecked_when_admin_role_changes_between_requests(): void
    {
        $this->actingAs($this->admin)->get('/productos')->assertOk();
        DB::table('users')->where('id', $this->admin->id)->update(['rol' => 'supervisor']);
        $this->post('/productos', $this->data())->assertForbidden();
        $this->assertSame(5, Product::count());
    }

    public function test_form_preserves_input_and_renders_spanish_field_errors_and_escaped_names(): void
    {
        $name = '<script>alert(1)</script>';
        $response = $this->actingAs($this->admin)->from('/productos/create')->post('/productos',
            $this->data(['nombre' => $name, 'precio' => '1.234', 'cantidad_minima' => 0]));
        $response->assertRedirect('/productos/create')->assertSessionHasErrors(['precio', 'cantidad_minima'])
            ->assertSessionHasInput('nombre', $name)->assertSessionHasInput('precio', '1.234');
        $this->withCookie(config('session.cookie'), $response->getCookie(config('session.cookie'))->getValue());
        $this->get('/productos/create')->assertOk()->assertSee('Revise los campos indicados')
            ->assertSee('Ingrese un precio positivo con hasta dos decimales')
            ->assertSee('Ingrese una cantidad mínima entre 1 y 999.')
            ->assertSee(e($name), false)->assertDontSee($name, false)->assertSee('value="1.234"', false);
        $this->post('/productos', $this->data(['nombre' => $name]))->assertSessionHasNoErrors();
        $this->get('/productos')->assertSee(e($name), false)->assertDontSee($name, false);
    }

    public function test_csrf_required_and_valid_token_allows_create(): void
    {
        $middleware = new class($this->app, $this->app->make('encrypter')) extends PreventRequestForgery
        {
            protected function runningUnitTests()
            {
                return false;
            }
        };
        $this->app->instance(PreventRequestForgery::class, $middleware);
        $this->actingAs($this->admin)->post('/productos', $this->data())->assertStatus(419);
        $this->assertSame(5, Product::count());
        $page = $this->get('/productos/create')->assertOk();
        $this->withCookie(config('session.cookie'), $page->getCookie(config('session.cookie'))->getValue());
        $this->post('/productos', $this->data(['_token' => session()->token()]))->assertRedirect('/productos')->assertSessionHasNoErrors();
        $this->assertSame(6, Product::count());
    }

    public function test_no_delete_route_or_operation_and_unknown_product_is_404(): void
    {
        $before = $this->product->getAttributes();
        $this->actingAs($this->admin)->delete('/productos/'.$this->product->id)->assertStatus(405);
        $this->get('/productos/999999999/edit')->assertNotFound();
        $this->put('/productos/999999999', $this->data())->assertNotFound();
        $this->assertSame($before, $this->product->fresh()->getAttributes());
        $this->assertSame(5, Product::count());
    }

    private function data(array $changes = []): array
    {
        return array_replace(['nombre' => 'Producto de prueba', 'precio' => '25.50', 'cantidad_minima' => 1, 'activo' => '1'], $changes);
    }

    private function otherDataSnapshot(): string
    {
        $rows = [];
        foreach (array_diff(SeedData::TABLES, ['productos']) as $table) {
            $rows[$table] = DB::table($table)->orderBy('id')->get();
        }

        return hash('sha256', json_encode($rows));
    }
}
