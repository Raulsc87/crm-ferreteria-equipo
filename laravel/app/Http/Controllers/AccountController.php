<?php

namespace App\Http\Controllers;

use App\Http\Requests\AccountRequest;
use App\Models\User;
use App\Services\AccountManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class AccountController extends Controller
{
    public function index(): View
    {
        return view('accounts.index', [
            'accounts' => User::with('supervisor:id,name')->orderBy('name')->get(['id', 'name', 'email', 'rol', 'supervisor_id', 'activo']),
        ]);
    }

    public function create(): View
    {
        return $this->form(new User(['rol' => 'vendedor', 'activo' => true]));
    }

    public function edit(User $account): View
    {
        return $this->form($account);
    }

    private function form(User $account): View
    {
        return view('accounts.form', [
            'account' => $account,
            'supervisors' => User::where('rol', 'supervisor')->where('activo', true)
                ->when($account->exists, fn ($query) => $query->where('id', '!=', $account->id))
                ->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(AccountRequest $request, AccountManager $manager): RedirectResponse
    {
        $manager->save($request->user(), $request->validated());

        return redirect()->route('accounts.index')->with('status', 'Cuenta creada correctamente.');
    }

    public function update(AccountRequest $request, User $account, AccountManager $manager): RedirectResponse
    {
        $manager->save($request->user(), $request->validated(), $account);

        return redirect()->route('accounts.index')->with('status', 'Cuenta actualizada correctamente.');
    }
}
