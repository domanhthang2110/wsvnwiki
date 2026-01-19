# Project Architecture

## Directory Structure

### `src/app`
Contains the App Router pages and layouts.
- `(wiki)`: Wiki-specific pages (public facing).
- `admin`: Admin dashboard and tools.
- `api`: API routes.
- `auth`: Authentication pages.

### `src/components`
- `features`: Domain-specific components grouped by feature (e.g., `wiki`, `admin`).
- `ui`: Generic, reusable UI components (buttons, inputs, etc.).
- `shared`: Components shared across multiple features.

### `src/lib`
Configuration and setup for external libraries.
- `supabase`: Supabase clients and configuration.

### `src/utils`
General utility functions and helpers.
- `imageLoader.ts`: Custom image loader for optimization.

### `src/types`
TypeScript type definitions.

### `src/services`
Business logic and specialized services (e.g., `skillsService`).

### `src/stores`
Global state management (Zustand stores).
