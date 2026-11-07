<?php

namespace App\Http\Controllers;

use App\Queries\SalesQueries;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class OpportunityController extends Controller
{
    public const STAGES = ['prospecto' => 'Prospecto', 'calificado' => 'Calificado', 'propuesta' => 'Propuesta', 'negociacion' => 'Negociación', 'ganada' => 'Ganada', 'perdida' => 'Perdida'];

    public function index(Request $request, SalesQueries $queries): View
    {
        $filters = $this->filters($request);
        $sellers = $queries->sellers($request->user())->select('id', 'name', 'activo')->orderBy('name')->get();
        if (isset($filters['vendedor_id'])) {
            // La búsqueda dentro del ámbito responde igual para un vendedor ajeno o inexistente.
            abort_unless($sellers->contains('id', $filters['vendedor_id']), 404);
        }
        $opportunities = $queries->opportunities($request->user())
            ->join('clientes as c', 'c.id', '=', 'o.cliente_id')->join('users as v', 'v.id', '=', 'o.vendedor_id')
            ->leftJoinSub($queries->lineTotals(), 'lineas', 'lineas.oportunidad_id', '=', 'o.id')
            ->select('o.id', 'o.titulo', 'o.etapa', 'o.fecha_cierre', 'c.nombre as cliente', 'v.name as vendedor')
            ->selectRaw('COALESCE(lineas.total, 0.00) AS total')
            ->when($filters['etapa'] ?? null, fn ($q, $stage) => $q->where('o.etapa', $stage))
            ->when($filters['vendedor_id'] ?? null, fn ($q, $seller) => $q->where('o.vendedor_id', $seller))
            ->orderByDesc('o.id')->paginate(20)->withQueryString();

        return view('opportunities.index', ['opportunities' => $opportunities, 'sellers' => $sellers, 'filters' => $filters, 'stages' => self::STAGES]);
    }

    private function filters(Request $request): array
    {
        abort_if(array_diff($request->query->keys(), ['etapa', 'vendedor_id', 'page']) !== [], 404);

        return $request->validate([
            'etapa' => ['nullable', Rule::in(array_keys(self::STAGES))],
            'vendedor_id' => ['nullable', 'integer', 'min:1'],
            'page' => ['nullable', 'integer', 'min:1'],
        ], [
            'etapa.*' => 'Seleccione una etapa válida.',
            'vendedor_id.*' => 'Seleccione un vendedor válido.',
            'page.*' => 'Seleccione una página válida.',
        ]);
    }
}
