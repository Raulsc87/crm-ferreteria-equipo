<x-app-layout>
    <x-slot name="header"><h1 class="font-semibold text-xl text-gray-800">Mi equipo</h1></x-slot>
    <div class="max-w-7xl mx-auto p-6 space-y-4">
        <form method="GET" action="{{ route('team.index') }}" class="bg-white rounded-lg shadow p-4 space-y-2">
            <x-input-label for="mes" value="Mes de ventas (Guatemala)" />
            <x-text-input id="mes" name="mes" type="month" :value="old('mes', $month)" min="1000-01" max="9998-12" required />
            <x-input-error :messages="$errors->get('mes')" />
            <x-primary-button>Consultar</x-primary-button>
        </form>
        <p>Mes consultado: <strong>{{ $month }}</strong> · America/Guatemala (UTC−6).</p>
        <p class="text-sm text-gray-600">La cartera muestra sus clientes actuales. Las ventas ganadas corresponden al cierre del mes y conservan los precios cotizados. Se incluyen vendedores inactivos.</p>
        <div class="overflow-x-auto bg-white rounded-lg shadow">
            <table class="w-full text-sm text-left">
                <caption class="sr-only">Vendedores de su equipo y ventas de {{ $month }}</caption>
                <thead class="bg-gray-100"><tr>
                    @foreach(['Nombre', 'Estado', 'Clientes asignados', 'Ventas ganadas', 'Total vendido (Q)'] as $heading)
                        <th scope="col" class="p-3">{{ $heading }}</th>
                    @endforeach
                </tr></thead>
                <tbody>
                    @forelse($sellers as $seller)
                        <tr class="border-t">
                            <td class="p-3">{{ $seller->name }}</td>
                            <td class="p-3">{{ $seller->activo ? 'Activo' : 'Inactivo' }}</td>
                            <td class="p-3">{{ $seller->clients_count }} de 10</td>
                            <td class="p-3">{{ $seller->ventas }}</td>
                            <td class="p-3">Q{{ number_format((float) $seller->total_vendido, 2, '.', ',') }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="5" class="p-3">Usted todavía no tiene vendedores asignados.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</x-app-layout>
