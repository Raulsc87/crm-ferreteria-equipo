<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->engine('InnoDB');
            $table->id();
            $table->foreignId('vendedor_id')->nullable()->constrained('users');
            $table->string('nombre', 150);
            $table->string('nit', 12)->nullable()->unique();
            $table->char('telefono', 8)->unique();
            $table->string('correo', 150)->nullable();
            $table->timestamps();
        });

        DB::statement("ALTER TABLE clientes ADD CONSTRAINT clientes_telefono_formato CHECK (REGEXP_LIKE(telefono, '^[2-9][0-9]{7}$'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
