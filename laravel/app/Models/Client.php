<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nombre', 'nit', 'telefono', 'correo', 'vendedor_id'])]
class Client extends Model
{
    protected $table = 'clientes';

    protected function casts(): array
    {
        return ['vendedor_id' => 'integer'];
    }

    public function scopeVisibleTo(Builder $query, User $actor): Builder
    {
        if (! $actor->canAccessPanel()) {
            return $query->whereRaw('1 = 0');
        }
        if ($actor->rol === 'administrador') {
            return $query;
        }

        return $query->where(fn (Builder $q) => $q->whereNull('vendedor_id')
            ->orWhereHas('seller', fn (Builder $u) => $u->where('supervisor_id', $actor->id)));
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendedor_id');
    }

    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class, 'cliente_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'cliente_id');
    }
}
