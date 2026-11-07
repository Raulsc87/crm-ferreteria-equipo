<x-guest-layout>
    <h1 class="text-xl font-semibold mb-2">CRM Ferretería</h1>
    <p class="text-sm text-gray-600 mb-6">Ingrese al panel con su cuenta de administrador o supervisor. Si es vendedor, use la aplicación del vendedor.</p>
    <x-auth-session-status class="mb-4" :status="session('status')" />
    <form method="POST" action="{{ route('login') }}">
        @csrf
        <div>
            <x-input-label for="email" value="Correo electrónico" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>
        <div class="mt-4">
            <x-input-label for="password" value="Contraseña" />
            <x-text-input id="password" class="block mt-1 w-full" type="password" name="password" required autocomplete="current-password" />
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>
        <p class="text-sm text-gray-600 mt-4">Si necesita restablecer su contraseña, consulte al administrador.</p>
        <x-primary-button class="mt-4">Ingresar</x-primary-button>
    </form>
</x-guest-layout>
