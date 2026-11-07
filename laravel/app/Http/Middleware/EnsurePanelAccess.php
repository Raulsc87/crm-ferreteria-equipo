<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsurePanelAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = User::find($request->user()?->getAuthIdentifier());
        if (! $user || ! $user->canAccessPanel()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Su cuenta ya no tiene acceso al panel. Consulte al administrador.',
            ]);
        }
        // Reemplazar cualquier instancia almacenada en el guard por el estado actual.
        Auth::guard('web')->setUser($user);

        return $next($request);
    }
}
