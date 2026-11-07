<?php

namespace App\Http\Requests;

use App\Rules\GuatemalanNit;
use App\Support\ClientIdentity;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessPanel() ?? false;
    }

    protected function prepareForValidation(): void
    {
        $values = [];
        if (is_string($this->input('nombre'))) {
            $values['nombre'] = trim(preg_replace('/\s+/u', ' ', $this->input('nombre')));
        }
        if ($this->exists('nit') && (is_string($this->input('nit')) || $this->input('nit') === null)) {
            $values['nit'] = ClientIdentity::nit($this->input('nit'));
        }
        if (is_string($this->input('telefono'))) {
            $values['telefono'] = ClientIdentity::phone($this->input('telefono'));
        }
        $this->merge($values);
    }

    public function rules(): array
    {
        $client = $this->route('client');
        $rules = [
            'nombre' => ['bail', 'required', 'string', 'max:150'],
            'nit' => ['bail', 'present', 'nullable', 'string', 'between:2,12', new GuatemalanNit, Rule::unique('clientes', 'nit')->ignore($client?->id)],
            'telefono' => ['bail', 'required', 'string', 'regex:/\A[2-9][0-9]{7}\z/', Rule::unique('clientes', 'telefono')->ignore($client?->id)],
            'correo' => ['bail', 'nullable', 'string', 'email', 'max:150'],
        ];
        // La edición de datos no modifica dueño: se usa una acción confirmada aparte.
        $rules['vendedor_id'] = $this->isMethod('post') ? ['nullable', 'integer'] : ['missing'];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'Ingrese el nombre del cliente.',
            'nombre.string' => 'Ingrese un nombre válido.',
            'nombre.max' => 'Use un nombre de hasta 150 caracteres.',
            'nit.present' => 'Ingrese el NIT o CF.',
            'nit.string' => 'Ingrese un NIT válido o CF.',
            'nit.between' => 'Ingrese un NIT de 2 a 12 caracteres o CF.',
            'nit.unique' => 'Este NIT ya está registrado. Revise los datos.',
            'telefono.required' => 'Ingrese el teléfono.',
            'telefono.string' => 'Ingrese un teléfono válido.',
            'telefono.regex' => 'Ingrese ocho dígitos que comiencen de 2 a 9; puede usar el prefijo +502.',
            'telefono.unique' => 'Este teléfono ya está registrado. Revise los datos.',
            'correo.string' => 'Ingrese un correo electrónico válido.',
            'correo.email' => 'Ingrese un correo electrónico válido.',
            'correo.max' => 'Use un correo de hasta 150 caracteres.',
            'vendedor_id.integer' => 'Seleccione un vendedor válido.',
            'vendedor_id.prohibited' => 'Use la acción Asignar para cambiar al vendedor.',
            'vendedor_id.missing' => 'Use la acción Asignar para cambiar al vendedor.',
        ];
    }
}
