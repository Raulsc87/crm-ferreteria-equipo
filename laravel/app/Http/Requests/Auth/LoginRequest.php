<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $message = 'El correo o la contraseña no son correctos.';
        $allowed = function ($user) use (&$message) {
            if (! $user->activo) {
                $message = 'Su cuenta está desactivada. Consulte al administrador.';

                return false;
            }
            if (! $user->canAccessPanel()) {
                $message = 'Debe usar la aplicación del vendedor para ingresar con esta cuenta.';

                return false;
            }

            return true;
        };

        if (! Auth::attemptWhen($this->only('email', 'password'), $allowed)) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => $message,
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => "Ha realizado demasiados intentos. Espere {$seconds} segundos e inténtelo de nuevo.",
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => mb_strtolower(trim($this->input('email')))]);
        }
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Ingrese su correo electrónico.',
            'email.string' => 'Ingrese un correo electrónico válido.',
            'email.email' => 'Ingrese un correo electrónico válido.',
            'password.required' => 'Ingrese su contraseña.',
            'password.string' => 'Ingrese una contraseña válida.',
        ];
    }
}
