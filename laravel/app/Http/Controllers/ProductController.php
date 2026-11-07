<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class ProductController extends Controller
{
    public function index(): View
    {
        return view('products.index', ['products' => Product::orderBy('nombre')->get()]);
    }

    public function create(): View
    {
        return view('products.form', ['product' => new Product]);
    }

    public function edit(Product $product): View
    {
        return view('products.form', compact('product'));
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $this->save($request);

        return redirect()->route('products.index')->with('status', 'Producto creado correctamente.');
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $this->save($request, $product);

        return redirect()->route('products.index')->with('status', 'Producto actualizado correctamente.');
    }

    private function save(ProductRequest $request, ?Product $product = null): void
    {
        try {
            DB::transaction(function () use ($request, $product) {
                $actor = User::whereKey($request->user()->id)->lockForUpdate()->first();
                abort_unless($actor && Gate::forUser($actor)->allows('manage-accounts'), 403);
                $target = $product ? Product::whereKey($product->id)->lockForUpdate()->firstOrFail() : new Product;
                $target->fill($request->validated())->save();
                // No se actualizan relaciones ni líneas previamente cotizadas.
            }, 3);
        } catch (QueryException $exception) {
            if (($exception->errorInfo[1] ?? null) === 1062) {
                throw ValidationException::withMessages(['nombre' => 'Este nombre ya está registrado. Ingrese otro.']);
            }
            throw $exception;
        }
    }
}
