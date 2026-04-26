// Single source of truth for navigation. Sidebars, top-bars, and any other
// nav surface should iterate this list (filtered by meta.sidebar etc.) rather
// than hard-code their own link tables.
//
// meta:
//   public      — route does not require authentication
//   requiresAuth — route requires authentication (enforced by router/index.js)
//   label       — display label for nav surfaces
//   icon        — Quasar/material icon name
//   sidebar     — include in MainLayout's left drawer
const routes = [
    {
        path: '/login',
        name: 'login',
        component: () => import( 'pages/LoginPage.vue' ),
        meta: { public: true },
    },

    {
        path: '/',
        component: () => import( 'layouts/MainLayout.vue' ),
        meta: { requiresAuth: true },
        children: [
            {
                path:      '',
                name:      'dashboard',
                component: () => import( 'pages/DashboardPage.vue' ),
                meta: { label: 'Dashboard', icon: 'dashboard', sidebar: true, exact: true },
            },
            {
                path:      'crates',
                name:      'crates',
                component: () => import( 'pages/CratesPage.vue' ),
                meta: { label: 'Crates', icon: 'inventory_2', sidebar: true },
            },
            {
                path:      'crates/:id',
                name:      'crate-detail',
                component: () => import( 'pages/CrateDetailPage.vue' ),
            },
            {
                path:      'junk',
                name:      'junk',
                component: () => import( 'pages/JunkPage.vue' ),
                meta: { label: 'Junk', icon: 'widgets', sidebar: true },
            },
            {
                path:      'junk/:id',
                name:      'junk-detail',
                component: () => import( 'pages/JunkDetailPage.vue' ),
            },
        ],
    },

    {
        path:      '/:catchAll(.*)*',
        name:      'not-found',
        component: () => import( 'pages/ErrorNotFound.vue' ),
    },
]

export default routes
