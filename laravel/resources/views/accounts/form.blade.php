<x-app-layout>
    <x-slot name="header"><h1 class="font-semibold text-xl text-gray-800">{{ $account->exists ? 'Editar cuenta' : 'Crear cuenta' }}</h1></x-slot>
    <div class="max-w-3xl mx-auto p-6">
        <form method="POST" action="{{ $account->exists ? route('accounts.update', $account) : route('accounts.store') }}" class="bg-white rounded-lg shadow p-6 space-y-5">
            @csrf
            @if($account->exists) @method('PUT') @endif
            @if($errors->any())<p role="alert" class="text-red-700">Revise los campos indicados. Sus datos no sensibles se han conservado.</p>@endif
            <div>
                <x-input-label for="name" value="Nombre" />
                <x-text-input id="name" name="name" :value="old('name', $account->name)" class="block mt-1 w-full" required maxlength="255" autocomplete="name" />
                <x-input-error :messages="$errors->get('name')" class="mt-2" />
            </div>
            <div>
                <x-input-label for="email" value="Correo electrónico" />
                <x-text-input id="email" name="email" type="email" :value="old('email', $account->email)" class="block mt-1 w-full" required maxlength="255" autocomplete="off" />
                <x-input-error :messages="$errors->get('email')" class="mt-2" />
            </div>
            <div>
                <x-input-label for="password" :value="$account->exists ? 'Nueva contraseña (opcional)' : 'Contraseña'" />
                <x-text-input id="password" name="password" type="password" class="block mt-1 w-full" autocomplete="new-password" :required="! $account->exists" />
                <p class="text-sm text-gray-600 mt-1">{{ $account->exists ? 'Déjela vacía para conservar la actual. ' : '' }}Use al menos 8 caracteres y hasta 72 bytes.</p>
                <x-input-error :messages="$errors->get('password')" class="mt-2" />
            </div>
            <div>
                <x-input-label for="password_confirmation" value="Confirme la contraseña" />
                <x-text-input id="password_confirmation" name="password_confirmation" type="password" class="block mt-1 w-full" autocomplete="new-password" />
                <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
            </div>
            <div>
                <x-input-label for="rol" value="Rol" />
                <select id="rol" name="rol" required class="block mt-1 w-full rounded-md border-gray-300">
                    @foreach(['administrador' => 'Administrador', 'supervisor' => 'Supervisor', 'vendedor' => 'Vendedor'] as $value => $label)
                        <option value="{{ $value }}" @selected(old('rol', $account->rol) === $value)>{{ $label }}</option>
                    @endforeach
                </select>
                <x-input-error :messages="$errors->get('rol')" class="mt-2" />
            </div>
            <div>
                <x-input-label for="supervisor_id" value="Supervisor (solo para vendedores)" />
                <select id="supervisor_id" name="supervisor_id" class="block mt-1 w-full rounded-md border-gray-300">
                    <option value="">Sin supervisor</option>
                    @if($account->supervisor_id && ! $supervisors->contains('id', $account->supervisor_id))
                        <option value="{{ $account->supervisor_id }}" @selected((string) old('supervisor_id', $account->supervisor_id) === (string) $account->supervisor_id)>Supervisor actual no disponible; seleccione uno activo</option>
                    @endif
                    @foreach($supervisors as $supervisor)
                        <option value="{{ $supervisor->id }}" @selected((string) old('supervisor_id', $account->supervisor_id) === (string) $supervisor->id)>{{ $supervisor->name }}</option>
                    @endforeach
                </select>
                <p class="text-sm text-gray-600 mt-1">Seleccione un supervisor activo para vendedores. Para los demás roles, deje «Sin supervisor».</p>
                <x-input-error :messages="$errors->get('supervisor_id')" class="mt-2" />
            </div>
            <div>
                <x-input-label for="activo" value="Estado" />
                <select id="activo" name="activo" required class="block mt-1 w-full rounded-md border-gray-300">
                    <option value="1" @selected((string) old('activo', (int) $account->activo) === '1')>Activa</option>
                    <option value="0" @selected((string) old('activo', (int) $account->activo) === '0')>Inactiva</option>
                </select>
                <x-input-error :messages="$errors->get('activo')" class="mt-2" />
            </div>
            @if($account->id === auth()->id())<p class="text-sm text-gray-600">No puede desactivar su propia cuenta ni quitarse el rol de administrador.</p>@endif
            <div class="flex flex-wrap gap-4 items-center">
                <x-primary-button>Guardar cuenta</x-primary-button>
                <a href="{{ route('accounts.index') }}" class="text-gray-700 underline">Cancelar</a>
            </div>
        </form>
    </div>
</x-app-layout>
