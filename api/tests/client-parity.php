<?php

// Contraste de formato con las reglas reales del panel; sin escrituras ni índices únicos.
use App\Http\Requests\ClientRequest;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Unique;

require __DIR__.'/../../laravel/vendor/autoload.php';
putenv('APP_ENV=testing');
$app = require __DIR__.'/../../laravel/bootstrap/app.php';
$app->loadEnvironmentFrom('.env.testing');
$app->make(Kernel::class)->bootstrap();
$result = [];
foreach (json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR) as $input) {
    foreach ($input as $field => $value) {
        if (is_string($value)) {
            $input[$field] = Str::trim($value);
            if ($input[$field] === '') {
                $input[$field] = null;
            }
        }
    }
    $request = ClientRequest::create('/clientes', 'POST', $input);
    (new ReflectionMethod($request, 'prepareForValidation'))->invoke($request);
    $rules = $request->rules();
    unset($rules['vendedor_id']);
    foreach ($rules as &$fieldRules) {
        $fieldRules = array_filter($fieldRules, fn ($rule) => ! $rule instanceof Unique);
    }
    unset($fieldRules);
    $validator = $app->make('validator')->make($request->all(), $rules, $request->messages());
    $valid = $validator->passes();
    $result[] = ['valid' => $valid, 'data' => $valid ? $validator->validated() : null, 'fields' => array_keys($validator->errors()->messages())];
}
echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
