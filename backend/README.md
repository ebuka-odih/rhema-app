# Wordflow Backend

Laravel API providing data for the Wordflow application.

## Setup

1. **Install Dependencies**:
   ```bash
   composer install
   ```

2. **Database**:
   The project is pre-configured with SQLite. 
   Database file is located at `database/database.sqlite`.

3. **Run Migrations & Seed**:
   ```bash
   php artisan migrate --seed
   ```
   (Note: `DevSeeder` is already run during initial setup)

4. **Start the Server**:
   ```bash
   php artisan serve
   ```

## API Endpoints

- `GET /api/user` - Get current authenticated user (Sanctum)
- `GET /api/verses` - Get daily verses
- `GET /api/notes` - Get user notes

## CORS
Configured in `config/cors.php`. Currently allowed for all origins (`*`) for easy development.
