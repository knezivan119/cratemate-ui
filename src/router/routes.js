const routes = [
    {
        path: '/login',
        component: () => import( 'pages/LoginPage.vue' ),
        meta: { public: true },
    },

    {
        path: '/',
        component: () => import( 'layouts/MainLayout.vue' ),
        meta: { requiresAuth: true },
        children: [
            { path: '', component: () => import( 'pages/DashboardPage.vue' ) },
            { path: 'crates', component: () => import( 'pages/CratesPage.vue' ) },
            { path: 'crates/:id', component: () => import( 'pages/CrateDetailPage.vue' ) },
            { path: 'junk', component: () => import( 'pages/JunkPage.vue' ) },
            { path: 'junk/:id', component: () => import( 'pages/JunkDetailPage.vue' ) },
        ],
    },

    {
        path: '/:catchAll(.*)*',
        component: () => import( 'pages/ErrorNotFound.vue' ),
    },
]

export default routes
