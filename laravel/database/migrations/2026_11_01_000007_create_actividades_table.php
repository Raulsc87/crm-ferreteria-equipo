<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actividades', function (Blueprint $table) {
            $table->engine('InnoDB');
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('vendedor_id')->constrained('users');
            $table->enum('tipo', ['llamada', 'reunion', 'tarea']);
            $table->string('descripcion', 500);
            $table->dateTime('vence_en')->nullable();
            $table->boolean('completada')->default(false);
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('actividades');
    }
};
