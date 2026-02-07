<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
    ],

    'openrouter' => [
        'key' => env('OPENROUTER_API_KEY'),
        'base_url' => env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
        'transcription_model' => env('OPENROUTER_TRANSCRIPTION_MODEL'),
        'summary_model' => env('OPENROUTER_SUMMARY_MODEL'),
        'http_referer' => env('OPENROUTER_HTTP_REFERER', env('APP_URL')),
        'title' => env('OPENROUTER_TITLE', env('APP_NAME', 'Wordflow')),
    ],

    'openai' => [
        'key' => env('OPENAI_API_KEY'),
    ],

    'apple' => [
        'client_id' => env('APPLE_CLIENT_ID', 'com.odih.rhema'),
        'client_ids' => array_filter(array_map('trim', explode(',', env('APPLE_CLIENT_IDS', '')))),
        'shared_secret' => env('APPLE_SHARED_SECRET'),
    ],

];
