<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientActionRequest;
use App\Http\Requests\ClientRequest;
use App\Models\Client;
use App\Models\User;
use App\Services\ClientManager;
use App\Support\ClientIdentity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class ClientController extends Controller
{
    public function index(Request $request): View
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:150'],
            'vendedor_id' => ['nullable', 'integer', 'min:1'],
            'sin_asignar' => ['nullable', 'boolean'],
        ], [
            'q.string' => 'Ingrese un nombre o NIT para buscar.',
            'q.max' => 'Use una búsqueda de hasta 150 caracteres.',
            'vendedor_id.integer' => 'Seleccione un vendedor válido.',
            'vendedor_id.min' => 'Seleccione un vendedor válido.',
            'sin_asignar.boolean' => 'Seleccione un filtro válido.',
        ]);
        if (! empty($filters['vendedor_id'])) {
            $seller = User::find($filters['vendedor_id']);
            if ($seller && $request->user()->rol === 'supervisor' && $seller->supervisor_id !== $request->user()->id) {
                abort(404);
            }
            if (! $seller || $seller->rol !== 'vendedor') {
                throw ValidationException::withMessages(['vendedor_id' => 'Seleccione un vendedor válido.']);
            }
            if ($request->boolean('sin_asignar')) {
                throw ValidationException::withMessages(['vendedor_id' => 'Use el filtro por vendedor o sin asignar, no ambos a la vez.']);
            }
        }
        $query = Client::visibleTo($request->user())->with('seller:id,name,activo')->withCount('opportunities');
        if ($request->filled('q')) {
            $text = trim($filters['q']);
            $nit = ClientIdentity::nit($text);
            $pattern = fn ($value) => '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $value).'%';
            $query->where(function (Builder $q) use ($text, $nit, $pattern) {
                $q->whereRaw("nombre LIKE ? ESCAPE '!'", [$pattern($text)]);
                if ($nit === null && mb_strtoupper(trim($text)) === 'CF') {
                    $q->orWhereNull('nit');
                } elseif ($nit !== null) {
                    $q->orWhereRaw("nit LIKE ? ESCAPE '!'", [$pattern($nit)]);
                }
            });
        }
        $query->when(! empty($filters['vendedor_id']), fn ($q) => $q->where('vendedor_id', $filters['vendedor_id']))
            ->when($request->boolean('sin_asignar'), fn ($q) => $q->whereNull('vendedor_id'));

        return view('clients.index', [
            'clients' => $query->orderBy('nombre')->get(),
            'sellers' => $this->sellers($request->user())->get(['id', 'name', 'activo']),
            'filters' => $filters,
        ]);
    }

    public function create(Request $request): View
    {
        return view('clients.form', ['client' => new Client, 'sellers' => $this->sellers($request->user())->where('activo', true)->get(['id', 'name'])]);
    }

    public function edit(Client $client): View
    {
        return view('clients.form', ['client' => $client->load('seller:id,name'), 'sellers' => collect()]);
    }

    public function store(ClientRequest $request, ClientManager $manager): RedirectResponse
    {
        $manager->create($request->user(), $request->validated());

        return redirect()->route('clients.index')->with('status', 'Cliente creado correctamente.');
    }

    public function update(ClientRequest $request, Client $client, ClientManager $manager): RedirectResponse
    {
        $manager->update($request->user(), $client, $request->validated());

        return redirect()->route('clients.index')->with('status', 'Datos del cliente actualizados correctamente.');
    }

    public function assignForm(Request $request, Client $client): View
    {
        return $this->confirmation($request, $client, 'asignar');
    }

    public function releaseForm(Request $request, Client $client): View
    {
        return $this->confirmation($request, $client, 'liberar');
    }

    public function deleteForm(Request $request, Client $client): View
    {
        return $this->confirmation($request, $client, 'eliminar');
    }

    private function confirmation(Request $request, Client $client, string $action): View
    {
        return view('clients.confirm', [
            'client' => $client->load('seller:id,name'), 'action' => $action,
            'sellers' => $this->sellers($request->user())->where('activo', true)->get(['id', 'name']),
        ]);
    }

    public function assign(ClientActionRequest $request, Client $client, ClientManager $manager): RedirectResponse
    {
        $manager->assign($request->user(), $client, (int) $request->validated('vendedor_id'), $this->expected($request));

        return redirect()->route('clients.index')->with('status', 'Asignación actualizada. Las oportunidades abiertas acompañan al cliente.');
    }

    public function release(ClientActionRequest $request, Client $client, ClientManager $manager): RedirectResponse
    {
        $manager->release($request->user(), $client, $this->expected($request));

        return redirect()->route('clients.index')->with('status', 'Cliente liberado. Ahora está disponible.');
    }

    public function destroy(ClientActionRequest $request, Client $client, ClientManager $manager): RedirectResponse
    {
        $manager->delete($request->user(), $client, $this->expected($request));

        return redirect()->route('clients.index')->with('status', 'Cliente y sus actividades eliminados correctamente.');
    }

    private function expected(ClientActionRequest $request): ?int
    {
        $value = $request->validated('expected_vendedor_id');

        return $value === null ? null : (int) $value;
    }

    private function sellers(User $actor): Builder
    {
        return User::where('rol', 'vendedor')->when($actor->rol === 'supervisor',
            fn ($q) => $q->where('supervisor_id', $actor->id))->orderBy('name');
    }
}
