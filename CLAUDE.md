# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CrateMate UI — the frontend for a household inventory management app. Users photograph and label items ("Junk"), organise them into containers ("Crates"), and search instead of rummaging. This repo is the SPA; the API lives in the sibling `../api/` directory (see its own CLAUDE.md for backend details).

## Domain Naming

Use only **Crate** and **Junk**. Never substitute Container, Item, Object, or Thing. A Crate can be a house, room, drawer, person, vehicle — the metaphor is load-bearing.

## File and Module Naming

Rule: **Thing + Kind**, singular noun first, role suffix second. The role suffix must match what the thing actually is — don't dress static config as a composable just because it's adjacent to one.

| Layer | Folder | File pattern | Example |
|---|---|---|---|
| Vue components | `src/components/<family>/` | `ThingKind.vue` (PascalCase) | `TextInput.vue`, `JunkCaptureDialog.vue` |
| Vue pages | `src/pages/` | `ThingPage.vue` (PascalCase) | `JunkDetailPage.vue` |
| Composables | `src/uses/` | `thingUse.js`, exports `useThing()` | `cameraUse.js`, `junkFormUse.js` |
| Static config / defaults | `src/defaults/` | `thingDefault.js`, exports `thingDefault` | `inputDefault.js`, `tableDefault.js` |
| Static reference data | `src/data/` | `thingData.js`, exports `thingData` (+ helpers) | `crateTypeData.js`, `unitData.js` |
| Pinia stores | `src/stores/` | `thingStore.js`, exports `useThingStore()` | `authStore.js` |
| TanStack queries | `src/queries/` | `thingQuery.js` | `junkQuery.js`, `crateQuery.js` |

Singular form throughout. `crateQuery.js`, not `cratesQuery.js`. Mirrors `CrateResource`, `JunkController` on the API side.

**`defaults/` vs `data/` — both static, different domain:**
- `defaults/` — config that shapes how *our* components behave (input defaults, table defaults). Framework-internal.
- `data/` — domain reference data (units, crate types, status taxonomies). Domain knowledge that the app is *about*. Lookup helpers (e.g. `iconForType`) ship alongside the data they index.

**Why predictability matters here:** the name is a promise about where the thing lives and what it does. When the rule holds across the whole project, you can type the path before finishing the thought ("input defaults" → `defaults/inputDefault.js`). When it's broken in spots — `useX.js` next to `thingStore.js` next to `thing.js` — every lookup demands a context switch and a memory load. For a solo project where the same person writes and reads the code, predictability beats every other naming axis.

**Don't cite "the X community does Y"** as authority. CrateMate is a personal tool; the user is the audience and the maker. Only first-principles arguments count when picking conventions here.

**Exception, principled:** Laravel Eloquent models stay as `Thing.php` (`Junk.php`, `Crate.php`). Eloquent + Laravel's container resolve by class name; the framework owns that naming axis and renaming would fight it for zero gain. Apply the same test if another framework joins: a framework that owns a naming axis gets to keep it.

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
npm run test                  # Vitest (composable unit tests)
npm run test:watch            # Vitest in watch mode
```

Tests live under `tests/` mirroring `src/` (`tests/uses/<thing>UseTest.js` for `src/uses/<thing>Use.js`). Discovery pattern is `**/*Test.js` to match the API side's `*Test.php` naming. Composable tests use a small `withSetup` helper from `tests/helpers/withSetupHelper.js` so lifecycle hooks fire inside a real Vue setup-context.

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
- `src/stores/` — Pinia stores (`authStore.js`, …)
- `src/queries/` — TanStack Query modules (`junkQuery.js`, `crateQuery.js`, `tagQuery.js`)
- `src/uses/` — composables (`cameraUse.js`, …)
- `src/defaults/` — static config bags shared across components (`inputDefault.js`, …)
- `src/data/` — static domain reference data (`crateTypeData.js`, …)
- `src/components/` — shared components, organised into families (`components/input/TextInput.vue`, dialogs like `CrateFormDialog`)
- `src/boot/` — Quasar boot files
- `src/css/app.scss` — global styles

## Current State

See `../platform/progress.md` for the workspace-wide snapshot. UI side: Sanctum login wired, TanStack Vue Query against the API, Crates and Junk pages with CRUD dialogs, camera capture composable in place.
