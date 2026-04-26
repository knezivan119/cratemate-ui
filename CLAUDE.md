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

**British English for our identifiers.** `colour`, `behaviour`, `organise`, `centre`, `analyse`. External APIs (Quasar's `:color` prop, the CSS `color` property, classes like `items-center`) keep their US spellings — that's a contract with the library/standard, not our naming. The bridge happens at the template (`<q-avatar :color="meta.colour" />`).

**No `px` in CSS.** Default unit is **rem**. `px` is only acceptable with explicit justification (e.g. raster-asset alignment). Conversion: 1rem = 16px → 4px = 0.25rem, 8px = 0.5rem, 16px = 1rem, 48px = 3rem, etc. Quasar size props (`size="3rem"`) accept rem directly.

**Templates stay clean.** Spread v-bind objects, inline lambdas, and validation arrays belong in script setup as named computeds/consts/functions. Templates should reference simple identifiers, not parse expressions. See `feedback_clean_templates` memory for the full rule.

**No inline `style="..."` and every component gets a filename class.** Inline styles only when the value is genuinely dynamic per-instance and can't be expressed via classes. The default is CSS classes — Quasar utilities for spacing/colour/text, scoped per-component classes for everything else. Each component's visible-root element gets a kebab-case class matching its filename (`SelectInput.vue` → `class="select-input"`, `CrateFormDialog.vue` → `class="crate-form-dialog"`). Makes DevTools scannable and gives `<style scoped>` a stable hook.

**Grid-friendly wrappers expose a `cols` prop (default 12).** Input wrappers (`TextInput`, `SelectInput`, etc.) take `cols` and apply `col-${cols}` to their root. Callers say `<NumberInput cols="6" />` instead of wrapping in a `<div class="col-6">`. Parent declares the row (e.g. `<div class="row q-col-gutter-md">`); children specify their own span via the prop.

## Architecture

- `src/router/routes.js` — **source of truth for navigation**. Each route carries `meta: { label, icon, sidebar, ... }`. Sidebars/menus iterate this list rather than maintain their own link tables.
- `src/layouts/MainLayout.vue` — app shell. Left drawer is generated from `routes.js` (filter `meta.sidebar === true`). Adding a sidebar entry means adding a route, never editing the layout.
- `src/pages/` — **lean route shells** (~5 lines each). A page reads route params and renders ONE component. No business logic in pages.
- `src/components/<domain>/` — components organised by domain (`auth/`, `crate/`, `junk/`, `input/`). Inside each domain folder you'll find:
    - `<Domain>List.vue`, `<Domain><Detail|Edit>View.vue` — the composite views a page renders.
    - `<Domain><Verb>Form.vue` — pure forms with no dialog wrapper. Drop into a page, dialog, tab, anywhere.
    - `<Domain><Verb>Dialog.vue` — thin q-dialog shells that host the matching form.
    - `<Domain><Thing>Widget.vue` / `Panel.vue` — smaller reusable pieces (`JunkCrateWidget`, `JunkPhotosPanel`).
- `src/stores/` — Pinia stores (`authStore.js`, …)
- `src/queries/` — TanStack Query modules (`junkQuery.js`, `crateQuery.js`, `tagQuery.js`)
- `src/uses/` — composables (`cameraUse.js`, `junkEditUse.js`, …)
- `src/defaults/` — static config bags shared across components (`inputDefault.js`, …)
- `src/data/` — static domain reference data (`crateTypeData.js`, …)
- `src/boot/` — Quasar boot files
- `src/css/app.scss` — global styles

**Page → View → smaller pieces.** A page like `JunkDetailPage.vue` is 5 lines: read `:id` from the route, render `<JunkEditView :junk-id="..." />`. The view composes `<JunkPhotosPanel>`, `<JunkCrateWidget>`, `<JunkEditForm>`. The form is reusable on its own — drop it in a side panel or tab and it works the same.

## Current State

See `../platform/progress.md` for the workspace-wide snapshot.

**Headline shape:**
- Pages are 5-line route shells; all real work in view/list/form components organised by domain folder (`components/{auth,crate,junk,input}/`).
- Logic in `src/uses/*Use.js` composables (8 of them); SFCs are templates + thin orchestration.
- Routes-driven nav: `routes.js` carries `meta: { label, icon, sidebar }`; `MainLayout` iterates.
- Input wrapper layer with `cols` prop and shared defaults (`defaults/inputDefault.js`).
- Domain widgets take whole domain objects (`<CrateTypeAvatar :crate="crate" />`).
- Vitest + happy-dom test suite — **64 composable tests** pass via `npm run test`.

**Cross-cutting rules** live in `../docs/rules.md` (project-agnostic) and as durable memories under `~/.claude/projects/.../memory/feedback_*.md`. Read those before refactoring patterns; they capture decisions about naming, formatting, layout, prop boundaries, etc., that apply everywhere.
