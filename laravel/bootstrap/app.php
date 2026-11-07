<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request): Response {
            if ($exception instanceof ValidationException && $request->hasSession()) {
                // El panel tiene campos escalares: un array inválido no debe romper el formulario al volver.
                $request->session()->flashInput(array_filter($request->session()->getOldInput(),
                    fn ($value) => is_scalar($value) || $value === null));
            }
            if ($response->getStatusCode() < 500) {
                if ($request->expectsJson() && ! $exception instanceof ValidationException) {
                    // Los errores HTTP también pueden incluir trazas JSON cuando debug está activo.
                    $message = match ($response->getStatusCode()) {
                        401 => 'Inicie sesión para continuar.',
                        403 => 'Usted no tiene permiso para realizar esta operación.',
                        404 => 'El recurso solicitado no está disponible.',
                        405 => 'El método de solicitud no está permitido.',
                        default => 'No se pudo completar la solicitud. Revise los datos e inténtelo de nuevo.',
                    };
                    $response->setContent(json_encode(['message' => $message], JSON_UNESCAPED_UNICODE));
                    $response->headers->set('Content-Type', 'application/json');
                }

                return $response;
            }
            // Mantener los detalles en el registro interno, nunca en la respuesta, incluso con debug activo.
            $message = 'No se pudo completar la solicitud. Inténtelo de nuevo; si el problema continúa, consulte al administrador.';

            return $request->expectsJson()
                ? response()->json(['message' => $message], $response->getStatusCode())
                : response()->view('errors.500', ['message' => $message], $response->getStatusCode());
        });
    })->create();
