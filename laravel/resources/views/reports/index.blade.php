<x-app-layout>
    <x-slot name="header"><h1 class="font-semibold text-xl text-gray-800">Reporte mensual</h1></x-slot>
    <div class="max-w-7xl mx-auto p-6 space-y-4">
        <form method="GET" action="{{ route('reports.index') }}" class="bg-white rounded-lg shadow p-4 space-y-2">
            <x-input-label for="mes" value="Mes de ventas (Guatemala)" />
            <x-text-input id="mes" name="mes" type="month" :value="old('mes', $month)" min="1000-01" max="9998-12" required />
            <x-input-error :messages="$errors->get('mes')" />
            <x-primary-button>Consultar</x-primary-button>
        </form>
        <p>Mes consultado: <strong>{{ $month }}</strong> · America/Guatemala (UTC−6).</p>
        <p>{{ auth()->user()->rol === 'administrador' ? 'Toda la empresa' : 'Únicamente su equipo actual' }}, incluidos vendedores inactivos.</p>
        <dl class="bg-white rounded-lg shadow p-4 grid gap-4 sm:grid-cols-3">
            <div><dt>Ventas ganadas del mes</dt><dd class="font-semibold">{{ $summary->ventas }}</dd></div>
            <div><dt>Total vendido del mes</dt><dd class="font-semibold">Q{{ number_format((float)$summary->total, 2, '.', ',') }}</dd></div>
            <div><dt>Pronóstico de todas las abiertas</dt><dd class="font-semibold">Q{{ number_format((float)$summary->pronostico, 2, '.', ',') }}</dd></div>
        </dl>
        <p class="text-sm text-gray-600">El pronóstico no se filtra por mes. Usa 10% para prospecto, 25% para calificado, 50% para propuesta y 75% para negociación. Todos los importes usan precios cotizados.</p>
        <h2 class="font-semibold text-lg">Por vendedor</h2>
        <div class="overflow-x-auto bg-white rounded-lg shadow">
            <table class="w-full text-sm text-left">
                <caption class="sr-only">Ventas mensuales y pronóstico por vendedor</caption>
                <thead class="bg-gray-100"><tr>
                    @foreach(['Vendedor', 'Estado', 'Ventas', 'Total vendido (Q)', 'Pronóstico (Q)'] as $heading)
                        <th scope="col" class="p-3">{{ $heading }}</th>
                    @endforeach
                </tr></thead>
                <tbody>
                    @forelse($sellers as $seller)
                        <tr class="border-t">
                            <td class="p-3">{{ $seller->name }}</td>
                            <td class="p-3">{{ $seller->activo ? 'Activo' : 'Inactivo' }}</td>
                            <td class="p-3">{{ $seller->ventas }}</td>
                            <td class="p-3">Q{{ number_format((float)$seller->total, 2, '.', ',') }}</td>
                            <td class="p-3">Q{{ number_format((float)$seller->pronostico, 2, '.', ',') }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="5" class="p-3">Usted no tiene vendedores en su ámbito.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <h2 class="font-semibold text-lg">Por producto</h2>
        <p class="text-sm text-gray-600">Se muestran productos cotizados en su ámbito. Una venta con varios productos cuenta en cada producto; esa columna no se suma para obtener el número de ventas de la empresa.</p>
        <div class="overflow-x-auto bg-white rounded-lg shadow">
            <table class="w-full text-sm text-left">
                <caption class="sr-only">Unidades e importe vendido del mes y pronóstico por producto</caption>
                <thead class="bg-gray-100"><tr>
                    @foreach(['Producto', 'Ventas', 'Unidades vendidas', 'Importe vendido (Q)', 'Pronóstico (Q)'] as $heading)
                        <th scope="col" class="p-3">{{ $heading }}</th>
                    @endforeach
                </tr></thead>
                <tbody>
                    @forelse($products as $product)
                        <tr class="border-t">
                            <td class="p-3">{{ $product->nombre }}</td>
                            <td class="p-3">{{ $product->ventas }}</td>
                            <td class="p-3">{{ $product->unidades }}</td>
                            <td class="p-3">Q{{ number_format((float)$product->total, 2, '.', ',') }}</td>
                            <td class="p-3">Q{{ number_format((float)$product->pronostico, 2, '.', ',') }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="5" class="p-3">No hay productos cotizados en su ámbito.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</x-app-layout>
