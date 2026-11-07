<?php

namespace Tests\Support;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/** Consultas de verificación de datos; no son reportes del panel o de la API. */
final class SeedControlQueries
{
    public const COMMON_EMAILS = ['admin@crm.test', 'sergio@crm.test', 'sandra@crm.test', 'valeria@crm.test', 'diego@crm.test', 'carlos@crm.test', 'ivan@crm.test'];

    public static function summary(array $emails, string $month): array
    {
        $start = CarbonImmutable::parse($month.'-01 00:00:00', 'America/Guatemala');
        $from = $start->utc()->format('Y-m-d H:i:s');
        $until = $start->addMonth()->utc()->format('Y-m-d H:i:s');
        $lines = DB::table('oportunidad_productos')
            ->selectRaw('oportunidad_id, SUM(cantidad * precio_unitario) AS total')->groupBy('oportunidad_id');
        $row = DB::table('oportunidades as o')->join('users as u', 'u.id', '=', 'o.vendedor_id')
            ->leftJoinSub($lines, 'l', 'l.oportunidad_id', '=', 'o.id')->whereIn('u.email', $emails)
            ->selectRaw("COALESCE(SUM(CASE WHEN o.etapa = 'ganada' AND o.fecha_cierre >= ? AND o.fecha_cierre < ? THEN 1 ELSE 0 END), 0) AS ventas", [$from, $until])
            ->selectRaw("COALESCE(SUM(CASE WHEN o.etapa = 'ganada' AND o.fecha_cierre >= ? AND o.fecha_cierre < ? THEN COALESCE(l.total, 0) ELSE 0 END), 0) AS total", [$from, $until])
            ->selectRaw("ROUND(COALESCE(SUM(COALESCE(l.total, 0) * CASE o.etapa WHEN 'prospecto' THEN 0.10 WHEN 'calificado' THEN 0.25 WHEN 'propuesta' THEN 0.50 WHEN 'negociacion' THEN 0.75 ELSE 0 END), 0), 2) AS pronostico")->first();
        $portfolio = DB::table('clientes as c')->join('users as u', 'u.id', '=', 'c.vendedor_id')->whereIn('u.email', $emails)->count();

        return ['ventas' => (int) $row->ventas, 'total' => (string) $row->total, 'pronostico' => (string) $row->pronostico, 'cartera' => $portfolio];
    }

    public static function controls(): array
    {
        return [
            'valeria_octubre' => self::summary(['valeria@crm.test'], '2026-10'),
            'valeria_noviembre' => self::summary(['valeria@crm.test'], '2026-11'),
            'diego_octubre' => self::summary(['diego@crm.test'], '2026-10'),
            'carlos_octubre' => self::summary(['carlos@crm.test'], '2026-10'),
            'sergio_octubre' => self::summary(DB::table('users as u')->join('users as s', 's.id', '=', 'u.supervisor_id')->where('s.email', 'sergio@crm.test')->pluck('u.email')->all(), '2026-10'),
            'sandra_octubre' => self::summary(DB::table('users as u')->join('users as s', 's.id', '=', 'u.supervisor_id')->where('s.email', 'sandra@crm.test')->pluck('u.email')->all(), '2026-10'),
            'empresa_comun_octubre' => self::summary(self::COMMON_EMAILS, '2026-10'),
        ];
    }

    public static function productSales(): array
    {
        return DB::table('oportunidad_productos as l')
            ->join('productos as p', 'p.id', '=', 'l.producto_id')
            ->join('oportunidades as o', 'o.id', '=', 'l.oportunidad_id')
            ->join('users as u', 'u.id', '=', 'o.vendedor_id')
            ->whereIn('u.email', self::COMMON_EMAILS)->where('o.etapa', 'ganada')
            ->where('o.fecha_cierre', '>=', '2026-10-01 06:00:00')->where('o.fecha_cierre', '<', '2026-11-01 06:00:00')
            ->groupBy('p.nombre')->orderBy('p.nombre')
            ->selectRaw('p.nombre, SUM(l.cantidad) AS unidades, SUM(l.cantidad * l.precio_unitario) AS total')
            ->get()->map(fn ($row) => [$row->nombre, (int) $row->unidades, (string) $row->total])->all();
    }
}
