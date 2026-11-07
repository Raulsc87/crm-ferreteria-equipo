<x-app-layout>
    <x-slot name="header"><h1 class="font-semibold text-xl text-gray-800">{{ ucfirst($action) }} cliente</h1></x-slot>
    <div class="max-w-3xl mx-auto p-6">
        <form method="POST" action="{{ $action === 'asignar' ? route('clients.assign', $client) : ($action === 'liberar' ? route('clients.release', $client) : route('clients.destroy', $client)) }}" class="bg-white rounded-lg shadow p-6 space-y-5">
            @csrf
            @if($action === 'asignar') @method('PATCH') @elseif($action === 'eliminar') @method('DELETE') @endif
            <input type="hidden" name="expected_vendedor_id" value="{{ $client->vendedor_id }}">
            <p>Cliente: <strong>{{ $client->nombre }}</strong>. Asignación actual: {{ $client->seller?->name ?? 'Disponible' }}.</p>
            @if($action === 'asignar')
                <div><x-input-label for="vendedor_id" value="Vendedor de destino" /><select id="vendedor_id" name="vendedor_id" required class="block mt-1 w-full rounded-md border-gray-300"><option value="">Seleccione un vendedor activo</option>@foreach($sellers as $seller)<option value="{{ $seller->id }}" @selected((string) old('vendedor_id') === (string) $seller->id)>{{ $seller->name }}</option>@endforeach</select><x-input-error :messages="$errors->get('vendedor_id')" class="mt-2" /></div>
                <p>Las oportunidades abiertas pasarán al nuevo vendedor. Las ventas cerradas conservarán su crédito y las actividades conservarán quién las registró.</p>
            @elseif($action === 'liberar')
                <p>El cliente quedará disponible. Solo puede liberarlo si no tiene oportunidades abiertas ni actividades pendientes.</p>
            @else
                <p class="text-red-700">Esta acción eliminará al cliente y sus actividades. Solo se permite si no tiene oportunidades, abiertas o cerradas.</p>
            @endif
            <x-input-error :messages="$errors->get('asignacion')" />
            <x-input-error :messages="$errors->get('expected_vendedor_id')" />
            <label class="block"><input type="checkbox" name="confirmar" value="1" required @checked(old('confirmar'))> Confirmo que deseo {{ $action }} este cliente.</label>
            <x-input-error :messages="$errors->get('confirmar')" />
            <div class="flex flex-wrap items-center gap-4"><x-primary-button>Confirmar acción</x-primary-button><a class="underline text-gray-700" href="{{ route('clients.index') }}">Cancelar</a></div>
        </form>
    </div>
</x-app-layout>
