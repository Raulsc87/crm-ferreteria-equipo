<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

class ReportMonth
{
    public static function fromRequest(Request $request): CarbonImmutable
    {
        // Ambos límites UTC deben caber en el DATETIME de MySQL.
        $data = $request->validate([
            'mes' => ['sometimes', 'required', 'string', 'regex:/^[1-9][0-9]{3}-(0[1-9]|1[0-2])$/', 'date_format:Y-m', 'before:9999-01'],
        ], ['mes.*' => 'Seleccione un mes válido entre 1000-01 y 9998-12.']);
        $month = $data['mes'] ?? CarbonImmutable::now('America/Guatemala')->format('Y-m');

        return CarbonImmutable::createFromFormat('!Y-m', $month, 'America/Guatemala');
    }
}
