<nav class="bg-white border-b border-gray-200" aria-label="Navegación principal">
    <div class="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
        <a href="{{ route('dashboard') }}" class="font-semibold text-gray-900">CRM Ferretería</a>
        <x-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')">Inicio</x-nav-link>
        <x-nav-link :href="route('clients.index')" :active="request()->routeIs('clients.*')">Clientes</x-nav-link>
        <x-nav-link :href="route('opportunities.index')" :active="request()->routeIs('opportunities.*')">Oportunidades</x-nav-link>
        <x-nav-link :href="route('reports.index')" :active="request()->routeIs('reports.*')">Reportes</x-nav-link>
        @can('view-team')
            <x-nav-link :href="route('team.index')" :active="request()->routeIs('team.*')">Mi equipo</x-nav-link>
        @endcan
        @can('manage-accounts')
            <x-nav-link :href="route('accounts.index')" :active="request()->routeIs('accounts.*')">Cuentas</x-nav-link>
            <x-nav-link :href="route('products.index')" :active="request()->routeIs('products.*')">Productos</x-nav-link>
        @endcan
        <span class="text-sm text-gray-600">{{ auth()->user()->name }}</span>
        <form method="POST" action="{{ route('logout') }}" class="sm:ms-auto">
            @csrf
            <x-secondary-button type="submit">Cerrar sesión</x-secondary-button>
        </form>
    </div>
</nav>
