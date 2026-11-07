<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ClientPolicy
{
    public function view(User $user, Client $client): Response
    {
        return Client::visibleTo($user)->whereKey($client->id)->exists()
            ? Response::allow() : Response::denyAsNotFound();
    }

    public function delete(User $user, Client $client): Response
    {
        $visible = $this->view($user, $client);

        return ! $visible->allowed() ? $visible : ($user->rol === 'administrador'
            ? Response::allow() : Response::deny('Solo el administrador puede eliminar clientes.'));
    }
}
