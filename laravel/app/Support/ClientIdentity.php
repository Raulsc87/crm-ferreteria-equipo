<?php

namespace App\Support;

final class ClientIdentity
{
    public static function nit(?string $value): ?string
    {
        $compact = mb_strtoupper(preg_replace('/[\s-]+/u', '', $value ?? ''));
        if ($compact === '' || $compact === 'CF') {
            return null;
        }
        $normalized = ltrim($compact, '0');

        return $normalized === '' ? '0' : $normalized;
    }

    public static function validNit(string $value): bool
    {
        if (! preg_match('/\A[1-9][0-9]{0,10}[0-9K]\z/', $value)) {
            return false;
        }
        $body = substr($value, 0, -1);
        $sum = 0;
        foreach (str_split(strrev($body)) as $index => $digit) {
            $sum += (int) $digit * ($index + 2);
        }
        $digit = (11 - ($sum % 11)) % 11;

        return substr($value, -1) === ($digit === 10 ? 'K' : (string) $digit);
    }

    public static function phone(string $value): string
    {
        $compact = preg_replace('/[\s.()\-]+/u', '', $value);
        if (str_starts_with($compact, '+502')) {
            return substr($compact, 4);
        }

        return strlen($compact) === 11 && str_starts_with($compact, '502') ? substr($compact, 3) : $compact;
    }
}
