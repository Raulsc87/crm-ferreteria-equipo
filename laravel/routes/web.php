<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\OpportunityController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TeamController;
use App\Http\Middleware\EnsurePanelAccess;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', EnsurePanelAccess::class])->group(function () {
    Route::view('/dashboard', 'dashboard')->name('dashboard');
    Route::get('/oportunidades', [OpportunityController::class, 'index'])->name('opportunities.index');
    Route::get('/reportes', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/mi-equipo', [TeamController::class, 'index'])->middleware('can:view-team')->name('team.index');
    Route::get('/clientes', [ClientController::class, 'index'])->name('clients.index');
    Route::get('/clientes/create', [ClientController::class, 'create'])->name('clients.create');
    Route::post('/clientes', [ClientController::class, 'store'])->name('clients.store');
    Route::prefix('clientes/{client}')->middleware('can:view,client')->group(function () {
        Route::get('edit', [ClientController::class, 'edit'])->name('clients.edit');
        Route::match(['put', 'patch'], '/', [ClientController::class, 'update'])->name('clients.update');
        Route::get('asignacion', [ClientController::class, 'assignForm'])->name('clients.assign-form');
        Route::patch('asignacion', [ClientController::class, 'assign'])->name('clients.assign');
        Route::get('liberar', [ClientController::class, 'releaseForm'])->name('clients.release-form');
        Route::post('liberar', [ClientController::class, 'release'])->name('clients.release');
        Route::get('eliminar', [ClientController::class, 'deleteForm'])->middleware('can:delete,client')->name('clients.delete-form');
        Route::delete('/', [ClientController::class, 'destroy'])->middleware('can:delete,client')->name('clients.destroy');
    });
    Route::middleware('can:manage-accounts')->group(function () {
        Route::resource('cuentas', AccountController::class)
            ->only(['index', 'create', 'store', 'edit', 'update'])
            ->parameters(['cuentas' => 'account'])->names('accounts');
        Route::resource('productos', ProductController::class)
            ->only(['index', 'create', 'store', 'edit', 'update'])
            ->parameters(['productos' => 'product'])->names('products');
    });
});

require __DIR__.'/auth.php';
