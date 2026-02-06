<?php

namespace App\Services;

class OpenRouter
{
    public static function key(): ?string
    {
        return config('services.openrouter.key');
    }

    public static function baseUrl(): string
    {
        return rtrim(config('services.openrouter.base_url'), '/');
    }

    public static function headers(): array
    {
        $headers = [];
        $referer = config('services.openrouter.http_referer');
        $title = config('services.openrouter.title');

        if ($referer) {
            $headers['HTTP-Referer'] = $referer;
        }

        if ($title) {
            $headers['X-Title'] = $title;
        }

        return $headers;
    }

    public static function transcriptionModel(): ?string
    {
        return config('services.openrouter.transcription_model');
    }

    public static function summaryModel(): ?string
    {
        return config('services.openrouter.summary_model');
    }
}
