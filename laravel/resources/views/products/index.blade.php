<x-app-layout>
    <x-slot name="header"><h1 class="font-semibold text-xl text-gray-800">Productos</h1></x-slot>
    <div class="max-w-7xl mx-auto p-6 space-y-4">
        @if(session('status'))<p role="status" class="text-green-800">{{ session('status') }}</p>@endif
        <a href="{{ route('products.create') }}" class="inline-block bg-indigo-700 text-white rounded px-4 py-2">Agregar producto</a>
        <p class="text-sm text-gray-600">Edite el catálogo y su cantidad mínima de venta. Para retirar un producto, cambie su estado a inactivo. Las cotizaciones previas se conservan.</p>
        <div class="overflow-x-auto bg-white rounded-lg shadow">
            <table class="w-full text-sm text-left">
                <caption class="sr-only">Catálogo de productos</caption>
                <thead class="bg-gray-100"><tr>
                    @foreach(['Nombre', 'Precio (Q)', 'Cantidad mínima', 'Estado', 'Acciones'] as $heading)
                        <th scope="col" class="p-3">{{ $heading }}</th>
                    @endforeach
                </tr></thead>
                <tbody>
                    @forelse($products as $product)
                        <tr class="border-t">
                            <td class="p-3">{{ $product->nombre }}</td>
                            <td class="p-3">Q{{ $product->precio }}</td>
                            <td class="p-3">{{ $product->cantidad_minima }}</td>
                            <td class="p-3">{{ $product->activo ? 'Activo' : 'Inactivo' }}</td>
                            <td class="p-3"><a href="{{ route('products.edit', $product) }}" class="text-indigo-700 underline" aria-label="Editar producto {{ $product->nombre }}">Editar</a></td>
                        </tr>
                    @empty
                        <tr><td colspan="5" class="p-3">Todavía no hay productos. Agregue el primero.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</x-app-layout>
