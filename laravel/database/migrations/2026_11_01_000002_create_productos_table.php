<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->engine('InnoDB');
            $table->id();
            $table->string('nombre', 120)->unique();
            $table->decimal('precio', 10, 2);
            $table->boolean('activo')->default(true);
            $table->smallInteger('cantidad_minima')->default(1);
            $table->timestamps();
        });

        DB::statement('ALTER TABLE productos ADD CONSTRAINT productos_precio_positivo CHECK (precio > 0)');
        DB::statement('ALTER TABLE productos ADD CONSTRAINT productos_cantidad_minima_rango CHECK (cantidad_minima BETWEEN 1 AND 999)');
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
