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
            { path: 'image-test', component: () => import( 'pages/ImageTestPage.vue' ) },
        ],
    },

    {
        path: '/:catchAll(.*)*',
        component: () => import( 'pages/ErrorNotFound.vue' ),
    },
]

export default routes
