<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Solo lectura/bloqueo de pendientes en L4; sin pantallas de actividades.
class Activity extends Model
{
    protected $table = 'actividades';

    protected $guarded = ['*'];

    protected function casts(): array
    {
        return ['completada' => 'boolean'];
    }
}
