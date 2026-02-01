<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/password/reset/{token}', function (string $token) {
    return response()->json(['message' => 'Please use the mobile app to reset your password.', 'token' => $token]);
})->name('password.reset');
