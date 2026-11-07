<?php

namespace App\Queries;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class SalesQueries
{
    private const PROBABILITY = "CASE o.etapa WHEN 'prospecto' THEN 0.10 WHEN 'calificado' THEN 0.25 WHEN 'propuesta' THEN 0.50 WHEN 'negociacion' THEN 0.75 ELSE 0 END";

    public function sellers(User $actor): EloquentBuilder
    {
        $query = User::query();
        if (! $actor->canAccessPanel()) {
            return $query->whereRaw('1 = 0');
        }

        if ($actor->rol === 'supervisor') {
            return $query->where('rol', 'vendedor')->where('supervisor_id', $actor->id);
        }

        // El administrador conserva también ventas cuyo titular cambió de rol.
        return $query->where(fn ($q) => $q->where('rol', 'vendedor')
            ->orWhereIn('id', DB::table('oportunidades')->select('vendedor_id')));
    }

    public function opportunities(User $actor): Builder
    {
        $query = DB::table('oportunidades as o');

        return $actor->canAccessPanel() && $actor->rol === 'administrador'
            ? $query : $query->whereIn('o.vendedor_id', $this->sellers($actor)->select('users.id'));
    }

    public function lineTotals(): Builder
    {
        // Una fila por oportunidad, aunque tenga varios productos.
        return DB::table('oportunidad_productos')
            ->selectRaw('oportunidad_id, SUM(cantidad * precio_unitario) AS total')
            ->groupBy('oportunidad_id');
    }

    public function summary(User $actor, CarbonImmutable $start): object
    {
        return $this->totals($actor, $start)->first();
    }

    public function bySeller(User $actor, CarbonImmutable $start): Builder
    {
        return $this->totals($actor, $start)->addSelect('o.vendedor_id')->groupBy('o.vendedor_id');
    }

    private function totals(User $actor, CarbonImmutable $start): Builder
    {
        $won = "o.etapa = 'ganada' AND o.fecha_cierre >= ? AND o.fecha_cierre < ?";
        $bounds = [$start->utc()->format('Y-m-d H:i:s'), $start->addMonth()->utc()->format('Y-m-d H:i:s')];

        return $this->opportunities($actor)
            ->leftJoinSub($this->lineTotals(), 'lineas', 'lineas.oportunidad_id', '=', 'o.id')
            ->selectRaw("COALESCE(SUM(CASE WHEN $won THEN 1 ELSE 0 END), 0) AS ventas", $bounds)
            ->selectRaw("COALESCE(SUM(CASE WHEN $won THEN COALESCE(lineas.total, 0) ELSE 0 END), 0) AS total", $bounds)
            // Redondear después de sumar: no sumar pronósticos ya redondeados.
            ->selectRaw('ROUND(COALESCE(SUM(COALESCE(lineas.total, 0) * '.self::PROBABILITY.'), 0), 2) AS pronostico');
    }

    public function byProduct(User $actor, CarbonImmutable $start): Builder
    {
        $won = "o.etapa = 'ganada' AND o.fecha_cierre >= ? AND o.fecha_cierre < ?";
        $bounds = [$start->utc()->format('Y-m-d H:i:s'), $start->addMonth()->utc()->format('Y-m-d H:i:s')];

        return $this->opportunities($actor)
            ->join('oportunidad_productos as l', 'l.oportunidad_id', '=', 'o.id')
            ->join('productos as p', 'p.id', '=', 'l.producto_id')
            ->select('p.id', 'p.nombre')
            ->selectRaw("COUNT(DISTINCT CASE WHEN $won THEN o.id END) AS ventas", $bounds)
            ->selectRaw("SUM(CASE WHEN $won THEN l.cantidad ELSE 0 END) AS unidades", $bounds)
            ->selectRaw("SUM(CASE WHEN $won THEN l.cantidad * l.precio_unitario ELSE 0 END) AS total", $bounds)
            ->selectRaw('ROUND(SUM(l.cantidad * l.precio_unitario * '.self::PROBABILITY.'), 2) AS pronostico')
            ->groupBy('p.id', 'p.nombre')->orderBy('p.nombre')->orderBy('p.id');
    }
}
