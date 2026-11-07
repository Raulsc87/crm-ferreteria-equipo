<?php

namespace App\Http\Requests;

use App\Rules\ProductPrice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('manage-accounts');
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('nombre'))) {
            $this->merge(['nombre' => trim(preg_replace('/\s+/u', ' ', $this->input('nombre')))]);
        }
    }

    public function rules(): array
    {
        return [
            'nombre' => ['bail', 'required', 'string', 'max:120', Rule::unique('productos', 'nombre')->ignore($this->route('product')?->id)],
            'precio' => ['bail', 'required', new ProductPrice],
            'cantidad_minima' => ['bail', 'required', 'integer', 'between:1,999'],
            'activo' => ['bail', 'required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'Ingrese el nombre del producto.',
            'nombre.string' => 'Ingrese un nombre válido.',
            'nombre.max' => 'Use un nombre de hasta 120 caracteres.',
            'nombre.unique' => 'Este nombre ya está registrado. Ingrese otro.',
            'precio.required' => 'Ingrese el precio del producto.',
            'cantidad_minima.required' => 'Ingrese la cantidad mínima de venta.',
            'cantidad_minima.integer' => 'Ingrese una cantidad mínima entera.',
            'cantidad_minima.between' => 'Ingrese una cantidad mínima entre 1 y 999.',
            'activo.required' => 'Seleccione el estado del producto.',
            'activo.boolean' => 'Seleccione un estado válido.',
        ];
    }
}
