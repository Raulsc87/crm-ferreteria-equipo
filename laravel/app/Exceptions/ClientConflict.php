<?php

namespace App\Exceptions;

use Illuminate\Validation\ValidationException;

class ClientConflict extends ValidationException
{
    public $status = 409;
}
