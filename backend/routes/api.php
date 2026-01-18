<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\BibleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SermonController;

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/verses', [ContentController::class, 'verses']);
    Route::get('/notes', [ContentController::class, 'notes']);

    Route::get('/sermons', [SermonController::class, 'index']);
    Route::post('/sermons', [SermonController::class, 'store']);
});

// Bible Routes (Public for now)
Route::get('/bible/versions', [BibleController::class, 'versions']);
Route::get('/bible/books', [BibleController::class, 'books']);
Route::get('/bible/chapter', [BibleController::class, 'chapter']);
Route::get('/bible/daily-verse', [BibleController::class, 'dailyVerse']);
Route::get('/bible/affirmation', [BibleController::class, 'dailyAffirmation']);
