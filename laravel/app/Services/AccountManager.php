<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AccountManager
{
    public function save(User $actor, array $data, ?User $account = null): User
    {
        try {
            return DB::transaction(function () use ($actor, $data, $account) {
                // Orden común para editar cuentas y asignar supervisores.
                $ids = array_filter([$actor->id, $account?->id, $data['supervisor_id'] ?? null]);
                $locked = User::whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
                $currentActor = $locked->get($actor->id);
                abort_unless($currentActor?->activo && $currentActor->rol === 'administrador', 403);
                $target = $account ? $locked->get($account->id) : new User;
                abort_if($account && ! $target, 404);
                if ($target->id === $actor->id) {
                    if (! (bool) $data['activo']) {
                        throw ValidationException::withMessages(['activo' => 'No puede desactivar su propia cuenta.']);
                    }
                    if ($data['rol'] !== 'administrador') {
                        throw ValidationException::withMessages(['rol' => 'No puede quitarse su propio rol de administrador.']);
                    }
                }
                if ($target->exists && $target->rol === 'supervisor' && $data['rol'] !== 'supervisor'
                    && User::where('supervisor_id', $target->id)->lockForUpdate()->get(['id'])->isNotEmpty()) {
                    throw ValidationException::withMessages(['rol' => 'Reasigne primero a los vendedores de este supervisor antes de cambiar su rol.']);
                }
                if ($data['rol'] === 'vendedor') {
                    $supervisor = $locked->get($data['supervisor_id'] ?? null);
                    if (! $supervisor || ! $supervisor->activo || $supervisor->rol !== 'supervisor' || $supervisor->id === $target->id) {
                        throw ValidationException::withMessages(['supervisor_id' => 'Seleccione otro usuario con rol supervisor que esté activo.']);
                    }
                } else {
                    $data['supervisor_id'] = null;
                }
                if (empty($data['password'])) {
                    unset($data['password']);
                }
                // El cast hashed de User genera el hash, sin aceptar campos arbitrarios.
                $target->fill($data);
                if ($target->isDirty('email')) {
                    $target->email_verified_at = null;
                }
                $target->save();

                return $target;
            }, 3);
        } catch (QueryException $exception) {
            if (($exception->errorInfo[1] ?? null) === 1062) {
                throw ValidationException::withMessages(['email' => 'Este correo ya está registrado. Ingrese otro.']);
            }
            throw $exception;
        }
    }
}
