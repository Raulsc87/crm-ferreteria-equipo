<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

// Solo soporte para transferir abiertas en L4; no hay módulo de oportunidades.
#[Fillable(['vendedor_id'])]
class Opportunity extends Model
{
    protected $table = 'oportunidades';
}
