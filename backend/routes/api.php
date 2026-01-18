<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\BibleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SermonController;
use App\Http\Controllers\Api\ReflectionController;
use App\Http\Controllers\Api\PrayerController;
use App\Http\Controllers\Api\BibleHighlightController;

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/user', [AuthController::class, 'updateProfile']);
    Route::patch('/user/password', [AuthController::class, 'updatePassword']);
    
    Route::get('/verses', [ContentController::class, 'verses']);
    Route::get('/notes', [ContentController::class, 'notes']);

    Route::get('/sermons', [SermonController::class, 'index']);
    Route::post('/sermons', [SermonController::class, 'store']);
    Route::patch('/sermons/{sermon}', [SermonController::class, 'update']);
    Route::delete('/sermons/{sermon}', [SermonController::class, 'destroy']);

    Route::get('/reflections', [ReflectionController::class, 'index']);
    Route::post('/reflections', [ReflectionController::class, 'store']);
    Route::patch('/reflections/{reflection}', [ReflectionController::class, 'update']);
    Route::delete('/reflections/{reflection}', [ReflectionController::class, 'destroy']);

    Route::get('/prayers', [PrayerController::class, 'index']);
    Route::post('/prayers', [PrayerController::class, 'store']);
    Route::patch('/prayers/{prayer}', [PrayerController::class, 'update']);
    Route::delete('/prayers/{prayer}', [PrayerController::class, 'destroy']);
    
    // Bible Highlights
    Route::get('/bible/highlights', [BibleHighlightController::class, 'index']);
    Route::get('/bible/highlights/chapter', [BibleHighlightController::class, 'getForChapter']);
    Route::post('/bible/highlights', [BibleHighlightController::class, 'store']);
    Route::delete('/bible/highlights/{id}', [BibleHighlightController::class, 'destroy']);
    Route::post('/bible/highlights/remove', [BibleHighlightController::class, 'deleteByVerse']);
});

// Bible Routes (Public for now)
Route::get('/bible/versions', [BibleController::class, 'versions']);
Route::get('/bible/books', [BibleController::class, 'books']);
Route::get('/bible/chapter', [BibleController::class, 'chapter']);
Route::get('/bible/daily-verse', [BibleController::class, 'dailyVerse']);
Route::get('/bible/affirmation', [BibleController::class, 'dailyAffirmation']);
