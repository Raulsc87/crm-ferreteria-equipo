<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class AccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('manage-accounts');
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => mb_strtolower(trim($this->input('email')))]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($this->route('account')?->id)],
            'password' => [$this->isMethod('post') ? 'required' : 'nullable', 'string', 'min:8', 'max:72', 'confirmed',
                function ($attribute, $value, $fail) {
                    if (is_string($value) && strlen($value) > 72) {
                        $fail('Use una contraseña de hasta 72 bytes.');
                    }
                }],
            'rol' => ['required', Rule::in(['administrador', 'supervisor', 'vendedor'])],
            'supervisor_id' => ['nullable', 'required_if:rol,vendedor', 'prohibited_unless:rol,vendedor', 'integer',
                Rule::exists('users', 'id')->where('rol', 'supervisor')->where('activo', true)],
            'activo' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Ingrese el nombre.',
            'name.string' => 'Ingrese un nombre válido.',
            'name.max' => 'Use un nombre de hasta 255 caracteres.',
            'email.required' => 'Ingrese el correo electrónico.',
            'email.string' => 'Ingrese un correo electrónico válido.',
            'email.email' => 'Ingrese un correo electrónico válido.',
            'email.max' => 'Use un correo de hasta 255 caracteres.',
            'email.unique' => 'Este correo ya está registrado. Ingrese otro.',
            'password.required' => 'Ingrese una contraseña para la nueva cuenta.',
            'password.string' => 'Ingrese una contraseña válida.',
            'password.min' => 'Use una contraseña de al menos 8 caracteres.',
            'password.max' => 'Use una contraseña de hasta 72 caracteres.',
            'password.confirmed' => 'La confirmación no coincide con la contraseña.',
            'rol.required' => 'Seleccione el rol.',
            'rol.in' => 'Seleccione un rol válido.',
            'supervisor_id.required_if' => 'Seleccione un supervisor activo para el vendedor.',
            'supervisor_id.prohibited_unless' => 'Deje el supervisor vacío para este rol.',
            'supervisor_id.integer' => 'Seleccione un supervisor válido.',
            'supervisor_id.exists' => 'Seleccione una cuenta con rol supervisor que esté activa.',
            'activo.required' => 'Seleccione el estado de la cuenta.',
            'activo.boolean' => 'Seleccione un estado válido.',
        ];
    }
}
