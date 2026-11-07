<x-app-layout>
    <x-slot name="header"><h1 class="font-semibold text-xl text-gray-800">{{ $product->exists ? 'Editar producto' : 'Agregar producto' }}</h1></x-slot>
    <div class="max-w-3xl mx-auto p-6">
        <form method="POST" action="{{ $product->exists ? route('products.update', $product) : route('products.store') }}" class="bg-white rounded-lg shadow p-6 space-y-5">
            @csrf
            @if($product->exists) @method('PUT') @endif
            @if($errors->any())<p role="alert" class="text-red-700">Revise los campos indicados. Se ha conservado lo que escribió.</p>@endif
            <div>
                <x-input-label for="nombre" value="Nombre" />
                <x-text-input id="nombre" name="nombre" :value="old('nombre', $product->nombre)" class="block mt-1 w-full" required maxlength="120" autofocus />
                <x-input-error :messages="$errors->get('nombre')" class="mt-2" />
            </div>
            <div>
                <x-input-label for="precio" value="Precio en quetzales" />
                <x-text-input id="precio" name="precio" type="text" inputmode="decimal" :value="old('precio', $product->precio)" class="block mt-1 w-full" required aria-describedby="precio-ayuda" />
                <p id="precio-ayuda" class="text-sm text-gray-600 mt-1">Ingrese de Q0.01 a Q99,999,999.99. Use punto decimal, hasta dos decimales y sin separadores de miles.</p>
                <x-input-error :messages="$errors->get('precio')" class="mt-2" />
            </div>
            <div>
                <x-input-label for="cantidad_minima" value="Cantidad mínima de venta" />
                <x-text-input id="cantidad_minima" name="cantidad_minima" type="number" min="1" max="999" step="1" :value="old('cantidad_minima', $product->cantidad_minima)" class="block mt-1 w-full" required />
                <p class="text-sm text-gray-600 mt-1">Ingrese un entero de 1 a 999. El valor inicial es 1.</p>
                <x-input-error :messages="$errors->get('cantidad_minima')" class="mt-2" />
            </div>
            <div>
                <x-input-label for="activo" value="Estado" />
                <select id="activo" name="activo" required class="block mt-1 w-full rounded-md border-gray-300">
                    <option value="1" @selected((string) old('activo', (int) $product->activo) === '1')>Activo</option>
                    <option value="0" @selected((string) old('activo', (int) $product->activo) === '0')>Inactivo</option>
                </select>
                <x-input-error :messages="$errors->get('activo')" class="mt-2" />
            </div>
            <p class="text-sm text-gray-600">Cambiar precio, mínimo o estado no modifica las líneas ya cotizadas.</p>
            <div class="flex flex-wrap gap-4 items-center">
                <x-primary-button>Guardar producto</x-primary-button>
                <a href="{{ route('products.index') }}" class="text-gray-700 underline">Cancelar</a>
            </div>
        </form>
    </div>
</x-app-layout>
