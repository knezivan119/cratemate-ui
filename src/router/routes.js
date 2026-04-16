const routes = [
    {
        path: '/',
        component: () => import( 'layouts/MainLayout.vue' ),
        children: [
            { path: '', component: () => import( 'pages/DashboardPage.vue' ) },
            { path: 'image-test', component: () => import( 'pages/ImageTestPage.vue' ) },
        ],
    },

    {
        path: '/:catchAll(.*)*',
        component: () => import( 'pages/ErrorNotFound.vue' ),
    },
]

export default routes
