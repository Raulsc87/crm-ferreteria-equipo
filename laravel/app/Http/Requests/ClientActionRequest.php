<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClientActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessPanel() ?? false;
    }

    public function rules(): array
    {
        $rules = [
            'confirmar' => ['accepted'],
            'expected_vendedor_id' => ['present', 'nullable', 'integer'],
        ];
        if ($this->routeIs('clients.assign')) {
            $rules['vendedor_id'] = ['required', 'integer'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'confirmar.accepted' => 'Confirme la acción antes de continuar.',
            'expected_vendedor_id.present' => 'Vuelva a abrir el formulario para comprobar la asignación actual.',
            'expected_vendedor_id.integer' => 'Vuelva a abrir el formulario para comprobar la asignación actual.',
            'vendedor_id.required' => 'Seleccione el vendedor de destino.',
            'vendedor_id.integer' => 'Seleccione un vendedor válido.',
        ];
    }
}
