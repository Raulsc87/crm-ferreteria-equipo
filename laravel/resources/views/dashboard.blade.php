<x-app-layout>
    <x-slot name="header"><h1 class="font-semibold text-xl text-gray-800">Inicio</h1></x-slot>
    <div class="max-w-7xl mx-auto p-6">
        <div class="bg-white rounded-lg shadow p-6 space-y-4">
            <p>Bienvenido/a, {{ auth()->user()->name }}. Su sesión está activa como {{ auth()->user()->rol }}.</p>
            <a href="{{ route('clients.index') }}" class="block text-indigo-700 underline">Consultar y administrar clientes</a>
            @can('manage-accounts')
                <a href="{{ route('accounts.index') }}" class="text-indigo-700 underline">Administrar cuentas</a>
            @else
                <p>Puede administrar los clientes de su equipo y los disponibles.</p>
            @endcan
            @can('view-team')
                <a href="{{ route('team.index') }}" class="block text-indigo-700 underline">Consultar Mi equipo</a>
            @endcan
        </div>
    </div>
</x-app-layout>
