<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('rol', ['administrador', 'supervisor', 'vendedor'])->default('vendedor');
            $table->foreignId('supervisor_id')->nullable()->constrained('users');
            $table->boolean('activo')->default(true);
        });

        // El rol de la fila referenciada se valida en la aplicación.
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_supervisor_segun_rol CHECK ((rol = 'vendedor' AND supervisor_id IS NOT NULL) OR (rol IN ('administrador', 'supervisor') AND supervisor_id IS NULL))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users DROP CHECK users_supervisor_segun_rol');
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['supervisor_id']);
            $table->dropColumn(['rol', 'supervisor_id', 'activo']);
        });
    }
};
