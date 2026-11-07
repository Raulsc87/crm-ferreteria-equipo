<?php

namespace App\Http\Controllers;

use App\Queries\SalesQueries;
use App\Support\ReportMonth;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ReportController extends Controller
{
    public function index(Request $request, SalesQueries $queries): View
    {
        abort_if(array_diff($request->query->keys(), ['mes']) !== [], 404);
        $start = ReportMonth::fromRequest($request);
        $actor = $request->user();
        $sellers = $queries->sellers($actor)->select('users.id', 'users.name', 'users.activo')
            ->leftJoinSub($queries->bySeller($actor, $start), 'cifras', 'cifras.vendedor_id', '=', 'users.id')
            ->selectRaw('COALESCE(cifras.ventas, 0) AS ventas, COALESCE(cifras.total, 0.00) AS total, COALESCE(cifras.pronostico, 0.00) AS pronostico')
            ->orderBy('users.name')->orderBy('users.id')->get();

        return view('reports.index', [
            'month' => $start->format('Y-m'), 'summary' => $queries->summary($actor, $start),
            'sellers' => $sellers, 'products' => $queries->byProduct($actor, $start)->get(),
        ]);
    }
}
