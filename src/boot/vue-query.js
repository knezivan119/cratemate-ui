import { defineBoot } from '#q-app/wrappers'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

const queryClient = new QueryClient( {
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 0,
        },
    },
} )

export { queryClient }

export default defineBoot( ( { app } ) => {
    app.use( VueQueryPlugin, { queryClient } )
} )
