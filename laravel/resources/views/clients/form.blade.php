<x-app-layout>
    <x-slot name="header"><h1 class="font-semibold text-xl text-gray-800">{{ $client->exists ? 'Editar cliente' : 'Crear cliente' }}</h1></x-slot>
    <div class="max-w-3xl mx-auto p-6">
        <form method="POST" action="{{ $client->exists ? route('clients.update', $client) : route('clients.store') }}" class="bg-white rounded-lg shadow p-6 space-y-5">
            @csrf
            @if($client->exists) @method('PUT') @endif
            @if($errors->any())<p role="alert" class="text-red-700">Revise los campos indicados. Se han conservado sus datos.</p>@endif
            <div><x-input-label for="nombre" value="Nombre" /><x-text-input id="nombre" name="nombre" :value="old('nombre', $client->nombre)" maxlength="150" required class="block mt-1 w-full" /><x-input-error :messages="$errors->get('nombre')" class="mt-2" /></div>
            <div><x-input-label for="nit" value="NIT o CF" /><x-text-input id="nit" name="nit" :value="old('nit', $client->nit ?? 'CF')" class="block mt-1 w-full" /><p class="text-sm text-gray-600 mt-1">Ingrese el NIT o CF para consumidor final. Se normalizan espacios, guiones y ceros iniciales.</p><x-input-error :messages="$errors->get('nit')" class="mt-2" /></div>
            <div><x-input-label for="telefono" value="Teléfono" /><x-text-input id="telefono" name="telefono" type="tel" :value="old('telefono', $client->telefono)" required class="block mt-1 w-full" /><p class="text-sm text-gray-600 mt-1">Ingrese ocho dígitos que comiencen de 2 a 9. Puede usar el prefijo +502.</p><x-input-error :messages="$errors->get('telefono')" class="mt-2" /></div>
            <div><x-input-label for="correo" value="Correo electrónico (opcional)" /><x-text-input id="correo" name="correo" type="email" :value="old('correo', $client->correo)" maxlength="150" class="block mt-1 w-full" /><x-input-error :messages="$errors->get('correo')" class="mt-2" /></div>
            @if(! $client->exists)
                <div><x-input-label for="vendedor_id" value="Asignación inicial (opcional)" /><select id="vendedor_id" name="vendedor_id" class="block mt-1 w-full rounded-md border-gray-300"><option value="">Disponible, sin asignar</option>@foreach($sellers as $seller)<option value="{{ $seller->id }}" @selected((string) old('vendedor_id') === (string) $seller->id)>{{ $seller->name }}</option>@endforeach</select><x-input-error :messages="$errors->get('vendedor_id')" class="mt-2" /></div>
            @else
                <p>Vendedor actual: {{ $client->seller?->name ?? 'Sin asignar' }}. Para cambiarlo, use <a class="underline text-indigo-700" href="{{ route('clients.assign-form', $client) }}">Asignar o reasignar</a>.</p>
            @endif
            <x-input-error :messages="$errors->get('asignacion')" />
            <div class="flex flex-wrap items-center gap-4"><x-primary-button>Guardar cliente</x-primary-button><a class="underline text-gray-700" href="{{ route('clients.index') }}">Cancelar</a></div>
        </form>
    </div>
</x-app-layout>
