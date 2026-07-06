# Receta Gatimi Frontend

React + Vite frontend for the recipe application.

## Run

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run build
```

## Project Map

- `src/main.tsx` mounts the app.
- `src/router.tsx` defines public, profile, recipe, and admin routes.
- `src/api.ts` is the shared API client, including auth headers and token refresh.
- `src/config/env.ts` centralizes environment-derived values.
- `src/lib/` contains small shared utilities that are not tied to a feature.
- `src/features/` contains feature-specific modules with their own API helpers, types, and components.
- `src/components/` contains shared UI/layout components used across pages.
- `src/pages/` contains route-level screens and loaders.
- `src/style/` contains global CSS and design tokens.

## Frontend Patterns

Route pages should stay focused on page composition, route loaders, and local screen state. Reusable behavior belongs in `src/features/<feature-name>` when it is domain-specific, or `src/lib` when it is generic.

API response parsing should use `readArrayPayload` from `src/lib/apiPayload.ts` instead of duplicating payload-shape checks in each page.

Favorite-related UI and API logic lives in `src/features/favorites`, so recipe cards and recipe detail pages share the same behavior.
