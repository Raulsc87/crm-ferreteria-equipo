<x-app-layout>
    <x-slot name="header"><h1 class="font-semibold text-xl text-gray-800">Cuentas</h1></x-slot>
    <div class="max-w-7xl mx-auto p-6 space-y-4">
        @if(session('status'))<p role="status" class="text-green-800">{{ session('status') }}</p>@endif
        <a href="{{ route('accounts.create') }}" class="inline-block bg-indigo-700 text-white rounded px-4 py-2">Crear cuenta</a>
        <p class="text-sm text-gray-600">Administre las cuentas y sus equipos. Para retirar el acceso, cambie el estado a inactiva; las cuentas se conservan.</p>
        <div class="overflow-x-auto bg-white rounded-lg shadow">
            <table class="w-full text-sm text-left">
                <caption class="sr-only">Cuentas del CRM</caption>
                <thead class="bg-gray-100"><tr>
                    @foreach(['Nombre', 'Correo', 'Rol', 'Supervisor', 'Estado', 'Acciones'] as $heading)
                        <th scope="col" class="p-3">{{ $heading }}</th>
                    @endforeach
                </tr></thead>
                <tbody>
                    @foreach($accounts as $account)
                        <tr class="border-t">
                            <td class="p-3">{{ $account->name }}</td><td class="p-3">{{ $account->email }}</td>
                            <td class="p-3">{{ ucfirst($account->rol) }}</td><td class="p-3">{{ $account->supervisor?->name ?? 'No corresponde' }}</td>
                            <td class="p-3">{{ $account->activo ? 'Activa' : 'Inactiva' }}</td>
                            <td class="p-3"><a href="{{ route('accounts.edit', $account) }}" class="text-indigo-700 underline" aria-label="Editar cuenta de {{ $account->name }}">Editar</a></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</x-app-layout>
