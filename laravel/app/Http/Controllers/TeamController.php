<?php

namespace App\Http\Controllers;

use App\Queries\SalesQueries;
use App\Support\ReportMonth;
use Illuminate\Http\Request;
use Illuminate\View\View;

class TeamController extends Controller
{
    public function index(Request $request, SalesQueries $queries): View
    {
        // El equipo siempre viene de la sesión; la URL solo admite el mes.
        abort_if(array_diff($request->query->keys(), ['mes']) !== [], 404);
        $start = ReportMonth::fromRequest($request);
        $month = $start->format('Y-m');
        $sellers = $request->user()->sellers()
            ->select('users.id', 'users.name', 'users.activo')->withCount('clients')
            ->leftJoinSub($queries->bySeller($request->user(), $start), 'ventas_mes', 'ventas_mes.vendedor_id', '=', 'users.id')
            ->selectRaw('COALESCE(ventas_mes.ventas, 0) AS ventas, COALESCE(ventas_mes.total, 0.00) AS total_vendido')
            ->orderBy('users.name')->orderBy('users.id')->get();

        return view('team.index', compact('sellers', 'month'));
    }
}
