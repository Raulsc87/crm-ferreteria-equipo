<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class SectorSeeder extends SeedData
{
    public function run(): void
    {
        DB::transaction(function () {
            if (! DB::table('users')->where('email', 'admin@crm.test')->exists()) {
                throw new RuntimeException('Ejecute primero VerificacionSeeder.');
            }
            if (DB::table('users')->where('email', 'like', '%@ferreteria.test')->exists()) {
                throw new RuntimeException('El sector ya tiene cuentas: no se sobrescriben datos.');
            }
            $north = $this->account('Lucía Méndez', 'lucia@ferreteria.test', 'supervisor');
            $south = $this->account('Jorge Choc', 'jorge@ferreteria.test', 'supervisor');
            $sellers = [
                $this->account('Elena Cux', 'elena@ferreteria.test', 'vendedor', $north),
                $this->account('Mateo León', 'mateo@ferreteria.test', 'vendedor', $south),
            ];
            // Referencias de precios consultadas el 2026-11-01, enlaces en README.
            $products = [];
            foreach ([
                ['Block para construcción 25 kg', '4.10', 50],
                ['Cemento UGC Progreso 42.5 kg', '83.00', 5],
                ['Tubo para drenaje 3 pulgadas', '65.00', 1],
                ['Tubo ducto PVC 3/8 pulgadas x 3 m', '18.00', 3],
                ['Guantes de trabajo (par)', '12.00', 1],
            ] as [$name, $price, $minimum]) {
                $products[] = [$this->insert('productos', [
                    'nombre' => $name, 'precio' => $price, 'activo' => true, 'cantidad_minima' => $minimum,
                ]), $price];
            }
            $clients = [];
            foreach (['Obras del Pinar', 'Acabados El Roble', 'Plomería Las Flores', 'Electricidad La Cumbre', 'Taller El Encino', 'Albañilería Nuevo Amanecer', 'Bodega Los Cipreses'] as $index => $name) {
                $clients[] = $this->insert('clientes', [
                    'nombre' => $name, 'vendedor_id' => $index === 6 ? null : $sellers[$index % 2],
                    'nit' => $index % 2 === 0 ? $this->nit('910000'.($index + 1)) : null,
                    'telefono' => '4900900'.($index + 1), 'correo' => 'cliente'.($index + 1).'@ferreteria.test',
                ]);
            }
            foreach ([
                ['Materiales para muro', 'prospecto', 0, 50, null, null],
                ['Cemento para ampliación', 'calificado', 1, 10, null, null],
                ['Drenaje de vivienda', 'propuesta', 2, 4, null, null],
                ['Canalización eléctrica', 'negociacion', 3, 6, null, null],
                ['Protección para cuadrilla', 'ganada', 4, 10, '2026-12-04 16:00:00', null],
                ['Muro de patio', 'perdida', 0, 100, '2026-12-05 16:00:00', 'Obra pospuesta por el cliente'],
            ] as $index => [$title, $stage, $product, $quantity, $close, $reason]) {
                [$productId, $price] = $products[$product];
                $this->opportunity($title, $clients[$index], $sellers[$index % 2], $stage, $close, [[$productId, $quantity, $price]], $reason);
            }
            foreach ([
                [0, 'llamada', 'Confirmar medidas del muro', '2030-01-10 16:00:00', false],
                [1, 'reunion', 'Coordinar entrega de cemento', '2030-01-11 15:00:00', false],
                [2, 'tarea', 'Preparar listado de accesorios', null, false],
                [4, 'llamada', 'Confirmar recepción de guantes', '2026-12-05 15:00:00', true],
            ] as [$index, $type, $description, $due, $complete]) {
                $this->insert('actividades', [
                    'cliente_id' => $clients[$index], 'vendedor_id' => $sellers[$index % 2],
                    'tipo' => $type, 'descripcion' => $description, 'vence_en' => $due, 'completada' => $complete,
                ]);
            }
        });
    }

    private function nit(string $body): string
    {
        $sum = 0;
        foreach (str_split(strrev($body)) as $index => $digit) {
            $sum += (int) $digit * ($index + 2);
        }
        $check = (11 - ($sum % 11)) % 11;

        return $body.($check === 10 ? 'K' : (string) $check);
    }
}
