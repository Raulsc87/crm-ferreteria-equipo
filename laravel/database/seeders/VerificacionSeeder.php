<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;

class VerificacionSeeder extends SeedData
{
    public function run(): void
    {
        DB::transaction(function () {
            self::requireEmptyBusinessTables();
            $users = [];
            $users['admin'] = $this->account('Alicia Morales', 'admin@crm.test', 'administrador');
            $users['sergio'] = $this->account('Sergio Ruiz', 'sergio@crm.test', 'supervisor');
            $users['sandra'] = $this->account('Sandra Pérez', 'sandra@crm.test', 'supervisor');
            $users['valeria'] = $this->account('Valeria López', 'valeria@crm.test', 'vendedor', $users['sergio']);
            $users['diego'] = $this->account('Diego Castillo', 'diego@crm.test', 'vendedor', $users['sergio']);
            $users['carlos'] = $this->account('Carlos Ajú', 'carlos@crm.test', 'vendedor', $users['sandra']);
            $users['ivan'] = $this->account('Iván Toj', 'ivan@crm.test', 'vendedor', $users['sandra'], false);
            $products = [];
            foreach ([
                ['Plan básico', '1200.00', true], ['Plan avanzado', '2750.50', true],
                ['Instalación', '450.00', true], ['Soporte anual', '3600.00', true],
                ['Licencia anterior', '999.99', false],
            ] as [$name, $price, $active]) {
                $products[$name] = $this->insert('productos', ['nombre' => $name, 'precio' => $price, 'activo' => $active, 'cantidad_minima' => 1]);
            }
            $clients = [];
            foreach ([
                ['valeria', 'Comercial El Quetzal', '4521817K', '55551234', 'compras@elquetzal.test'],
                ['valeria', 'Ferretería Xela', '98765434', '77612345', null],
                ['valeria', 'María Coyoy', null, '41234567', null],
                ['diego', 'Farmacia Los Altos', '34567895', '77634567', 'gerencia@losaltos.test'],
                ['diego', 'Luis Tzul', null, '52345678', null],
                ['carlos', 'Abarrotes San Juan', '12345679', '77651001', null],
                ['carlos', 'Panadería La Esperanza', null, '30001002', null],
                ['carlos', 'Taller El Volcán', '22233342', '77651003', null],
                ['carlos', 'Ana Xicará', null, '30001004', null],
                ['carlos', 'Librería Cantel', '55566677', '77651005', null],
                ['carlos', 'Pedro Batz', null, '30001006', null],
                ['carlos', 'Tienda La Bendición', null, '30001007', null],
                ['carlos', 'Distribuidora Occidente', '77788893', '77651008', null],
                ['carlos', 'Rosa Tax', null, '30001009', null],
                ['ivan', 'Hotel Los Pinos', '66655544', '77661001', null],
                [null, 'Agencia Cuatro Caminos', null, '30002001', null],
                [null, 'Café Zunil', null, '30002002', null],
                [null, 'Clínica San Rafael', '8889990K', '77672003', null],
                [null, 'Constructora Altiplano', '44433328', '77672004', null],
                [null, 'Escuela Futuro', null, '30002005', null],
                [null, 'Gimnasio Fuerza', null, '30002006', null],
            ] as [$seller, $name, $nit, $phone, $email]) {
                $clients[$name] = $this->insert('clientes', [
                    'vendedor_id' => $seller === null ? null : $users[$seller],
                    'nombre' => $name, 'nit' => $nit, 'telefono' => $phone, 'correo' => $email,
                ]);
            }
            foreach ([
                ['Renovación de planes', 'Comercial El Quetzal', 'valeria', 'ganada', '2026-10-05 16:00:00', [['Plan avanzado', 2, '2600.00'], ['Instalación', 1, '450.00']], null],
                ['Equipo para sucursal', 'Ferretería Xela', 'valeria', 'ganada', '2026-11-01 03:30:00', [['Plan básico', 3, '1200.00']], null],
                ['Soporte del hogar', 'María Coyoy', 'valeria', 'ganada', '2026-11-01 06:30:00', [['Soporte anual', 1, '3600.00']], null],
                ['Ampliación a bodega', 'Comercial El Quetzal', 'valeria', 'negociacion', null, [['Plan avanzado', 1, '2750.50']], null],
                ['Capacitación de personal', 'Ferretería Xela', 'valeria', 'propuesta', null, [['Instalación', 2, '450.00']], null],
                ['Plan familiar', 'María Coyoy', 'valeria', 'perdida', '2026-10-20 18:00:00', [['Plan básico', 1, '1200.00'], ['Licencia anterior', 1, '999.99']], 'Eligió a la competencia'],
                ['Seguimiento anual', 'Comercial El Quetzal', 'valeria', 'prospecto', null, [], null],
                ['Licencias de caja', 'Farmacia Los Altos', 'diego', 'ganada', '2026-10-10 15:00:00', [['Plan básico', 2, '1200.00'], ['Soporte anual', 1, '3600.00']], null],
                ['Mantenimiento', 'Luis Tzul', 'diego', 'calificado', null, [['Instalación', 1, '450.00']], null],
                ['Plan anual', 'Abarrotes San Juan', 'carlos', 'ganada', '2026-10-15 20:00:00', [['Soporte anual', 2, '3600.00']], null],
                ['Cotización de equipo', 'Taller El Volcán', 'carlos', 'negociacion', null, [['Plan avanzado', 2, '2750.50']], null],
            ] as [$title, $client, $seller, $stage, $close, $lines, $reason]) {
                $lines = array_map(fn ($line) => [$products[$line[0]], $line[1], $line[2]], $lines);
                $this->opportunity($title, $clients[$client], $users[$seller], $stage, $close, $lines, $reason);
            }
            foreach ([
                ['Comercial El Quetzal', 'valeria', 'llamada', 'Confirmar fecha de instalación', '2026-10-08 15:00:00', true],
                ['Ferretería Xela', 'valeria', 'tarea', 'Enviar propuesta de capacitación', '2030-01-15 15:00:00', false],
                ['María Coyoy', 'valeria', 'reunion', 'Presentar opciones de soporte', '2026-09-01 15:00:00', false],
                ['Farmacia Los Altos', 'diego', 'llamada', 'Renovación de licencias', '2030-02-01 15:00:00', false],
            ] as [$client, $seller, $type, $description, $due, $complete]) {
                $this->insert('actividades', [
                    'cliente_id' => $clients[$client], 'vendedor_id' => $users[$seller], 'tipo' => $type,
                    'descripcion' => $description, 'vence_en' => $due, 'completada' => $complete,
                ]);
            }
        });
    }
}
