<x-app-layout>
    <x-slot name="header"><h1 class="font-semibold text-xl text-gray-800">Oportunidades</h1></x-slot>
    <div class="max-w-7xl mx-auto p-6 space-y-4">
        @php
            $selectedStage = old('etapa', $filters['etapa'] ?? '');
            $selectedSeller = old('vendedor_id', $filters['vendedor_id'] ?? '');
        @endphp
        <p>Consulta de solo lectura. Las oportunidades las trabajará el vendedor desde su aplicación.</p>
        <form method="GET" action="{{ route('opportunities.index') }}" class="bg-white rounded-lg shadow p-4 flex flex-wrap items-end gap-4">
            <div class="min-w-0 w-full sm:w-auto">
                <x-input-label for="etapa" value="Etapa" />
                <select id="etapa" name="etapa" class="w-full max-w-full border-gray-300 rounded-md">
                    <option value="">Todas las etapas</option>
                    @foreach($stages as $value => $label)
                        <option value="{{ $value }}" @selected($selectedStage === $value)>{{ $label }}</option>
                    @endforeach
                </select>
                <x-input-error :messages="$errors->get('etapa')" />
            </div>
            <div class="min-w-0 w-full sm:w-auto">
                <x-input-label for="vendedor_id" value="Vendedor" />
                <select id="vendedor_id" name="vendedor_id" class="w-full max-w-full border-gray-300 rounded-md">
                    <option value="">Todos los vendedores de su ámbito</option>
                    @foreach($sellers as $seller)
                        <option value="{{ $seller->id }}" @selected(is_scalar($selectedSeller) && (string)$selectedSeller === (string)$seller->id)>{{ $seller->name }}{{ $seller->activo ? '' : ' (Inactivo)' }}</option>
                    @endforeach
                </select>
                <x-input-error :messages="$errors->get('vendedor_id')" />
            </div>
            <x-primary-button>Filtrar</x-primary-button>
            <a href="{{ route('opportunities.index') }}" class="text-indigo-700 underline">Limpiar filtros</a>
            <x-input-error :messages="$errors->get('page')" />
        </form>
        <div class="overflow-x-auto bg-white rounded-lg shadow">
            <table class="w-full text-sm text-left">
                <caption class="sr-only">Oportunidades de su ámbito</caption>
                <thead class="bg-gray-100"><tr>
                    @foreach(['Cliente', 'Vendedor', 'Título', 'Etapa', 'Total (Q)', 'Cierre (Guatemala, UTC−6)'] as $heading)
                        <th scope="col" class="p-3">{{ $heading }}</th>
                    @endforeach
                </tr></thead>
                <tbody>
                    @forelse($opportunities as $opportunity)
                        <tr class="border-t">
                            <td class="p-3">{{ $opportunity->cliente }}</td>
                            <td class="p-3">{{ $opportunity->vendedor }}</td>
                            <td class="p-3">{{ $opportunity->titulo }}</td>
                            <td class="p-3">{{ $stages[$opportunity->etapa] }}</td>
                            <td class="p-3">Q{{ number_format((float)$opportunity->total, 2, '.', ',') }}</td>
                            <td class="p-3">{{ $opportunity->fecha_cierre ? \Carbon\CarbonImmutable::parse($opportunity->fecha_cierre, 'UTC')->setTimezone('America/Guatemala')->format('d/m/Y H:i') : 'Sin cierre' }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="6" class="p-3">No hay oportunidades para los filtros seleccionados.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        {{ $opportunities->links() }}
    </div>
</x-app-layout>
