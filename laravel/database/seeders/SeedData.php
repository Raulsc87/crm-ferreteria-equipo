<?php

namespace Database\Seeders;

use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

/** Utilidades exclusivas de las semillas; no implementan reglas de la aplicación. */
abstract class SeedData extends Seeder
{
    public const TABLES = ['users', 'productos', 'clientes', 'oportunidades', 'oportunidad_productos', 'historial_etapas', 'actividades'];

    public const PUBLIC_PASSWORD = 'Ventas2026';

    protected const INITIAL_DATE = '2026-08-31 12:00:00';

    protected function account(string $name, string $email, string $role, ?int $supervisor = null, bool $active = true): int
    {
        return $this->insert('users', [
            'name' => $name, 'email' => $email, 'rol' => $role,
            'supervisor_id' => $supervisor, 'activo' => $active,
            'password' => Hash::make(self::PUBLIC_PASSWORD),
        ]);
    }

    protected function insert(string $table, array $values): int
    {
        return DB::table($table)->insertGetId($values + [
            'created_at' => self::INITIAL_DATE, 'updated_at' => self::INITIAL_DATE,
        ]);
    }

    protected function opportunity(string $title, int $client, int $seller, string $stage, ?string $close, array $lines, ?string $reason = null): int
    {
        $path = ['prospecto', 'calificado', 'propuesta', 'negociacion'];
        $path = match ($stage) {
            'ganada' => [...$path, 'ganada'],
            'perdida' => ['prospecto', 'calificado', 'propuesta', 'perdida'],
            default => array_slice($path, 0, array_search($stage, $path, true) + 1),
        };
        $end = CarbonImmutable::parse($close ?? '2026-10-02 16:00:00', 'UTC');
        $start = $end->subDays(3 * (count($path) - 1));
        $id = $this->insert('oportunidades', [
            'cliente_id' => $client, 'vendedor_id' => $seller, 'titulo' => $title,
            'etapa' => $stage, 'motivo_perdida' => $reason, 'fecha_cierre' => $close,
            'created_at' => $start->format('Y-m-d H:i:s'), 'updated_at' => $end->format('Y-m-d H:i:s'),
        ]);
        foreach ($lines as [$product, $quantity, $price]) {
            $this->insert('oportunidad_productos', [
                'oportunidad_id' => $id, 'producto_id' => $product, 'cantidad' => $quantity,
                'precio_unitario' => $price,
                'created_at' => $start->format('Y-m-d H:i:s'), 'updated_at' => $start->format('Y-m-d H:i:s'),
            ]);
        }
        foreach ($path as $index => $next) {
            DB::table('historial_etapas')->insert([
                'oportunidad_id' => $id, 'usuario_id' => $seller,
                'etapa_anterior' => $index === 0 ? null : $path[$index - 1], 'etapa_nueva' => $next,
                'created_at' => $start->addDays(3 * $index)->format('Y-m-d H:i:s'),
            ]);
        }

        return $id;
    }

    public static function requireEmptyBusinessTables(): void
    {
        foreach (self::TABLES as $table) {
            if (DB::table($table)->exists()) {
                throw new RuntimeException('Carga detenida: las tablas del negocio deben estar vacías; no se sobrescriben datos.');
            }
        }
    }
}
