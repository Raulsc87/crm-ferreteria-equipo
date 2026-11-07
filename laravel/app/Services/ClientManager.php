<?php

namespace App\Services;

use App\Exceptions\ClientConflict;
use App\Models\Client;
use App\Models\User;
use Closure;
use Illuminate\Database\QueryException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ClientManager
{
    public function create(User $actor, array $data): Client
    {
        $destination = isset($data['vendedor_id']) ? (int) $data['vendedor_id'] : null;

        return $this->locked($actor, null, $destination, function ($current, $client, $users) use ($data, $destination) {
            if ($destination !== null) {
                $this->destination($current, $users->get($destination));
                $this->capacity($destination);
            }

            return Client::create($data);
        });
    }

    public function update(User $actor, Client $client, array $data): Client
    {
        return $this->locked($actor, $client, null, function ($current, $locked) use ($data) {
            $locked->fill(Arr::only($data, ['nombre', 'nit', 'telefono', 'correo']))->save();

            return $locked;
        });
    }

    public function assign(User $actor, Client $client, int $destination, ?int $expected): Client
    {
        return $this->locked($actor, $client, $destination, function ($current, $locked, $users) use ($destination, $expected) {
            $this->expected($locked, $expected);
            $this->destination($current, $users->get($destination));
            if ($locked->vendedor_id !== $destination) {
                $this->capacity($destination);
                // Cliente bloqueado antes de sus oportunidades; las cerradas no se tocan.
                $open = $locked->opportunities()->whereNotIn('etapa', ['ganada', 'perdida'])->orderBy('id')->lockForUpdate()->get();
                foreach ($open as $opportunity) {
                    $opportunity->vendedor_id = $destination;
                    $opportunity->save();
                }
                $locked->vendedor_id = $destination;
                $locked->save();
            }

            return $locked;
        });
    }

    public function release(User $actor, Client $client, ?int $expected): Client
    {
        return $this->locked($actor, $client, null, function ($current, $locked) use ($expected) {
            $this->expected($locked, $expected);
            if ($locked->vendedor_id === null) {
                throw ClientConflict::withMessages(['asignacion' => 'El cliente ya está disponible. Actualice la página.']);
            }
            $open = $locked->opportunities()->whereNotIn('etapa', ['ganada', 'perdida'])->orderBy('id')->lockForUpdate()->get(['id']);
            $pending = $locked->activities()->where('completada', false)->orderBy('id')->lockForUpdate()->get(['id']);
            if ($open->isNotEmpty() || $pending->isNotEmpty()) {
                throw ClientConflict::withMessages(['asignacion' => 'No puede liberar al cliente mientras tenga oportunidades abiertas o actividades pendientes.']);
            }
            $locked->vendedor_id = null;
            $locked->save();

            return $locked;
        });
    }

    public function delete(User $actor, Client $client, ?int $expected): void
    {
        $this->locked($actor, $client, null, function ($current, $locked) use ($expected) {
            abort_unless($current->rol === 'administrador', 403);
            $this->expected($locked, $expected);
            if ($locked->opportunities()->orderBy('id')->lockForUpdate()->get(['id'])->isNotEmpty()) {
                throw ClientConflict::withMessages(['asignacion' => 'No puede eliminar un cliente que tenga oportunidades, aunque estén cerradas.']);
            }
            // MySQL elimina en cascada únicamente las actividades de este cliente.
            $locked->delete();
        });
    }

    private function locked(User $actor, ?Client $client, ?int $destination, Closure $operation): mixed
    {
        // Lectura orientativa fuera de transacción; se contrasta tras bloquear.
        $observed = $client ? Client::findOrFail($client->id) : null;
        $owner = $observed?->vendedor_id;
        try {
            return DB::transaction(function () use ($actor, $client, $destination, $owner, $operation) {
                $sellers = array_unique(array_filter([$owner, $destination], fn ($id) => $id !== null));
                $ids = array_unique([$actor->id, ...$sellers]);
                sort($ids, SORT_NUMERIC);
                $users = collect();
                foreach ($ids as $id) {
                    $query = User::whereKey($id);
                    $user = in_array($id, $sellers, true) ? $query->lockForUpdate()->first() : $query->sharedLock()->first();
                    if ($user) {
                        $users->put($id, $user);
                    }
                }
                $current = $users->get($actor->id);
                abort_unless($current?->canAccessPanel(), 403);
                $locked = $client ? Client::whereKey($client->id)->lockForUpdate()->firstOrFail() : null;
                if ($locked) {
                    abort_unless(Client::visibleTo($current)->whereKey($locked->id)->exists(), 404);
                    if ($locked->vendedor_id !== $owner) {
                        throw ClientConflict::withMessages(['asignacion' => 'La asignación cambió mientras guardaba. Actualice la página y vuelva a intentarlo.']);
                    }
                }

                return $operation($current, $locked, $users);
            }, 3);
        } catch (QueryException $exception) {
            if (($exception->errorInfo[1] ?? null) === 1062) {
                $field = str_contains($exception->errorInfo[2] ?? '', 'clientes_nit_unique') ? 'nit' : 'telefono';
                throw ClientConflict::withMessages([$field => $field === 'nit'
                    ? 'Este NIT ya está registrado. Revise los datos.' : 'Este teléfono ya está registrado. Revise los datos.']);
            }
            if (($exception->errorInfo[1] ?? null) === 1451) {
                throw ClientConflict::withMessages(['asignacion' => 'El cliente tiene registros asociados y no se puede eliminar.']);
            }
            throw $exception;
        }
    }

    private function destination(User $actor, ?User $seller): void
    {
        if ($seller && $actor->rol === 'supervisor' && $seller->id !== $actor->id && $seller->supervisor_id !== $actor->id) {
            abort(404);
        }
        if (! $seller || $seller->rol !== 'vendedor' || ! $seller->activo) {
            throw ValidationException::withMessages(['vendedor_id' => 'Seleccione una cuenta de vendedor activa.']);
        }
    }

    private function capacity(int $seller): void
    {
        // Lectura actual, no un COUNT de una instantánea anterior al bloqueo del vendedor.
        if (Client::where('vendedor_id', $seller)->orderBy('id')->lockForUpdate()->get(['id'])->count() >= 10) {
            throw ClientConflict::withMessages(['vendedor_id' => 'El vendedor ya tiene diez clientes. Seleccione otro vendedor.']);
        }
    }

    private function expected(Client $client, ?int $expected): void
    {
        if ($client->vendedor_id !== $expected) {
            throw ClientConflict::withMessages(['asignacion' => 'La asignación cambió. Actualice la página antes de confirmar.']);
        }
    }
}
