<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ProductPrice implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Comprobar dígitos y rango como texto; no redondear ni convertir dinero a float.
        if ((! is_string($value) && ! is_int($value) && ! is_float($value))
            || ! preg_match('/\A[0-9]+(?:\.[0-9]{1,2})?\z/', (string) $value)) {
            $fail('Ingrese un precio positivo con hasta dos decimales, usando punto decimal.');

            return;
        }

        $text = (string) $value;
        $integer = ltrim(explode('.', $text)[0], '0');
        if (strlen($integer) > 8 || ! preg_match('/[1-9]/', $text)) {
            $fail('Ingrese un precio entre Q0.01 y Q99,999,999.99.');
        }
    }
}
