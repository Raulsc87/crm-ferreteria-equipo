<x-app-layout>
    <x-slot name="header"><h1 class="font-semibold text-xl text-gray-800">Clientes</h1></x-slot>
    <div class="max-w-7xl mx-auto p-6 space-y-4">
        @if(session('status'))<p role="status" class="text-green-800">{{ session('status') }}</p>@endif
        <a href="{{ route('clients.create') }}" class="inline-block bg-indigo-700 text-white rounded px-4 py-2">Crear cliente</a>
        <form method="GET" action="{{ route('clients.index') }}" class="bg-white rounded-lg shadow p-4 space-y-4">
            <div>
                <x-input-label for="q" value="Buscar por nombre o NIT" />
                <x-text-input id="q" name="q" :value="old('q', $filters['q'] ?? '')" maxlength="150" class="block mt-1 w-full" />
                <x-input-error :messages="$errors->get('q')" class="mt-2" />
            </div>
            <div>
                <x-input-label for="vendedor_id" value="Vendedor" />
                <select id="vendedor_id" name="vendedor_id" class="block mt-1 w-full rounded-md border-gray-300">
                    <option value="">Todos los vendedores de su ámbito</option>
                    @foreach($sellers as $seller)<option value="{{ $seller->id }}" @selected((string) old('vendedor_id', $filters['vendedor_id'] ?? '') === (string) $seller->id)>{{ $seller->name }}{{ $seller->activo ? '' : ' (inactivo)' }}</option>@endforeach
                </select>
                <x-input-error :messages="$errors->get('vendedor_id')" class="mt-2" />
            </div>
            <label class="block"><input type="checkbox" name="sin_asignar" value="1" @checked(old('sin_asignar', $filters['sin_asignar'] ?? false))> Mostrar solo clientes sin asignar</label>
            <x-input-error :messages="$errors->get('sin_asignar')" />
            <div class="flex gap-4 items-center"><x-primary-button>Buscar y filtrar</x-primary-button><a href="{{ route('clients.index') }}" class="underline text-gray-700">Limpiar filtros</a></div>
        </form>
        <p class="text-sm text-gray-600">La lista muestra identificación y asignación. Abra Editar para consultar los datos de contacto permitidos.</p>
        <div class="overflow-x-auto bg-white rounded-lg shadow">
            <table class="w-full text-sm text-left">
                <caption class="sr-only">Clientes de su ámbito</caption>
                <thead class="bg-gray-100"><tr>@foreach(['ID', 'Nombre', 'Vendedor', 'Acciones'] as $heading)<th class="p-3" scope="col">{{ $heading }}</th>@endforeach</tr></thead>
                <tbody>
                    @forelse($clients as $client)
                        <tr class="border-t">
                            <td class="p-3">{{ $client->id }}</td><td class="p-3">{{ $client->nombre }}</td>
                            <td class="p-3">{{ $client->seller?->name ?? 'Disponible' }}{{ $client->seller && ! $client->seller->activo ? ' (inactivo)' : '' }}</td>
                            <td class="p-3 space-x-3">
                                <a class="text-indigo-700 underline" href="{{ route('clients.edit', $client) }}">Editar</a>
                                <a class="text-indigo-700 underline" href="{{ route('clients.assign-form', $client) }}">{{ $client->vendedor_id ? 'Reasignar' : 'Asignar' }}</a>
                                @if($client->vendedor_id)<a class="text-indigo-700 underline" href="{{ route('clients.release-form', $client) }}">Liberar</a>@endif
                                @can('delete', $client)
                                    @if($client->opportunities_count === 0)<a class="text-red-700 underline" href="{{ route('clients.delete-form', $client) }}">Eliminar</a>@endif
                                @endcan
                            </td>
                        </tr>
                    @empty<tr><td colspan="4" class="p-3">No hay clientes con estos filtros.</td></tr>@endforelse
                </tbody>
            </table>
        </div>
    </div>
</x-app-layout>
