# Rhema Daily (WordFlow)

Rhema Daily is a comprehensive spiritual companion application designed to help users engage with scripture, track their prayer life, and journal their spiritual journey. It features an offline Bible, daily personalized verses, and voice-enabled journaling powered by AI.

## Project Structure

This monorepo contains the following main components:

- **`app/`**: The mobile and web application built with **React Native (Expo)**.
- **`backend/`**: A robust **Laravel** API backend managing data migrations, complex business logic, and traditional API routes.
- **`server/`**: A lightweight, high-performance **Hono** (Node.js) server handling specific microservices and **Better Auth** authentication.
- **`bible-translations/`**: Contains raw JSON data for various Bible translations used for offline access.

---

## 📱 Mobile Application (`/app`)

The core user experience is delivered through a high-performance React Native app compatible with iOS, Android, and Web.

### Key Features
- **Daily Inspiration**: Personalized "Verse of the Day" and affirmations.
- **Journaling**: Rich text and voice-to-text journaling capabilities.
- **Offline Bible**: fast, local access to scripture using SQLite.
- **AI Integration**: Powered by Google Gemini (`@google/genai`) for content generation and transcription.

### Tech Stack
- **Framework**: Expo SDK 54 (React Native 0.81)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS v4)
- **State/Nav**: React Query, Standard Expo Router (implied)
- **Audio**: `expo-audio`
- **Build Tool**: Vite (Web), Metro (Native)

### Getting Started (App)
1. Navigate to the app directory:
   ```bash
   cd app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   # or for prebuild/dev client
   npm run ios
   npm run android
   ```

---

## 🛠 Backend Services

### Laravel Backend (`/backend`)
A full-featured Laravel application that serves as the primary API for complex data operations.

- **Stack**: PHP 8.2+, Laravel 12
- **Database**: SQLite / MySQL
- **Setup**:
  ```bash
  cd backend
  composer install
  cp .env.example .env
  php artisan key:generate
  php artisan migrate
  php artisan serve
  ```

### Hono Server (`/server`)
A modern, edge-compatible TypeScript server used for high-performance tasks and handling authentication.

- **Stack**: Node.js, Hono, Drizzle ORM, Better Auth
- **Database**: SQLite (via Better-SQLite3)
- **Setup**:
  ```bash
  cd server
  npm install
  npm run dev
  ```

---

## 📖 Data Sources (`/bible-translations`)

This directory houses the source data for Bible texts. These JSON files are parsed and seeded into the SQLite databases used by the mobile app for offline reading.

## Development Workflow

### Prerequisites
- Node.js (v18+)
- PHP (v8.2+) / Composer
- Xcode / Android Studio (for native mobile development)

### Running the Full Stack
It is recommended to run the services in separate terminal tabs:
1. **Terminal 1 (Backend)**: `cd backend && php artisan serve`
2. **Terminal 2 (Server)**: `cd server && npm run dev`
3. **Terminal 3 (App)**: `cd app && npm start`

## Deployment

- **Mobile**: Deployed via **EAS (Expo Application Services)**.
  ```bash
  cd app
  eas build --platform ios --profile production
  ```
- **Backend / Server**: Standard PHP/Node deployment pipelines.

## License

Proprietary. All rights reserved.
