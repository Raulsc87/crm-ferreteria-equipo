<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nombre', 'precio', 'cantidad_minima', 'activo'])]
class Product extends Model
{
    protected $table = 'productos';

    protected $attributes = ['cantidad_minima' => 1, 'activo' => true];

    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'cantidad_minima' => 'integer',
            'activo' => 'boolean',
        ];
    }
}
