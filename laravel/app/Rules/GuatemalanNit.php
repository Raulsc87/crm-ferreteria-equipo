<?php

namespace App\Rules;

use App\Support\ClientIdentity;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class GuatemalanNit implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! ClientIdentity::validNit($value)) {
            $fail('Ingrese un NIT guatemalteco válido o CF.');
        }
    }
}
