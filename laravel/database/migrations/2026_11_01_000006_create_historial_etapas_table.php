<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historial_etapas', function (Blueprint $table) {
            $table->engine('InnoDB');
            $table->id();
            $table->foreignId('oportunidad_id')->constrained('oportunidades')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('users');
            $table->enum('etapa_anterior', ['prospecto', 'calificado', 'propuesta', 'negociacion', 'ganada', 'perdida'])->nullable();
            $table->enum('etapa_nueva', ['prospecto', 'calificado', 'propuesta', 'negociacion', 'ganada', 'perdida']);
            $table->dateTime('created_at');
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('historial_etapas');
    }
};
