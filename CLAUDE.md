# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CrateMate UI — the frontend for a household inventory management app. Users photograph and label items ("Junk"), organise them into containers ("Crates"), and search instead of rummaging. This repo is the SPA; the API lives in the sibling `../api/` directory (see its own CLAUDE.md for backend details).

## Domain Naming

Use only **Crate** and **Junk**. Never substitute Container, Item, Object, or Thing. A Crate can be a house, room, drawer, person, vehicle — the metaphor is load-bearing.

## Tech Stack

- **Framework:** Quasar 2 (Vue 3, Composition API, `<script setup>`)
- **Build:** Quasar CLI with Vite (`@quasar/app-vite`)
- **State:** Pinia 3
- **Routing:** Vue Router 5 (hash mode)
- **Linting:** ESLint 9 flat config with `eslint-plugin-vue`
- **Local dev:** DDEV (generic type, Node 22, no database — `omit_containers: [db]`)

## Development Environment

```bash
ddev start                    # Start DDEV — auto-runs `npm run dev` as a daemon
ddev stop                     # Stop containers
ddev ssh                      # Shell into the web container
npm run dev                   # Quasar dev server (inside container or locally)
npm run build                 # Production build → dist/<APP_ENV>/
npm run lint                  # ESLint
```

The UI is served at https://cratemate-ui.ddev.site when DDEV is running. The Quasar dev server runs on container port 9000, exposed via DDEV on ports 80/443.

## Environment / Config

- Environment files live in `_env/` — `quasar.config.js` loads them via Vite's `loadEnv` using `APP_ENV` (defaults to `development`).
- `API_URL` env var points the frontend at the backend.
- Build output goes to `dist/<APP_ENV>/`.

## Code Style

Matches the API's bracket-spacing convention — **spaces inside parentheses, brackets, and braces**:

```js
import { ref } from 'vue'
const items = [ 'one', 'two' ]
if ( foo === bar ) { ... }
doSomething( arg )
```

ESLint enforces this via `space-in-parens`, `array-bracket-spacing`, `object-curly-spacing`, and `computed-property-spacing` rules. Additional style rules: single quotes, no semicolons, stroustrup brace style, 4-space indent.

## Architecture

- `src/layouts/MainLayout.vue` — app shell with left drawer navigation
- `src/pages/` — route-level page components, lazy-loaded
- `src/router/routes.js` — route definitions; route guards via `requiresAuth` / `public` meta
- `src/stores/` — Pinia stores (e.g. `auth-store`, `crate-store`)
- `src/components/` — shared dialogs (e.g. `CrateFormDialog`, `JunkFormDialog`)
- `src/boot/` — Quasar boot files
- `src/css/app.scss` — global styles

## Current State

See `../platform/progress.md` for the workspace-wide snapshot. UI side: Sanctum login wired, TanStack Vue Query against the API, Crates and Junk pages with CRUD dialogs, camera capture composable in place.
