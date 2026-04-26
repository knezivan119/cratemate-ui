import { createApp, h } from 'vue'

// Run a composable inside a real Vue component-setup context, so lifecycle
// hooks (onMounted / onBeforeUnmount / etc.) actually fire.
//
// Returns { result, unmount }:
//   - result is whatever the composable returned
//   - unmount tears down the host component (use it in afterEach to flush
//     onBeforeUnmount handlers and avoid cross-test bleed).
export function withSetup ( composable ) {
    let result
    const app = createApp( {
        setup () {
            result = composable()
            // Render nothing — we just need the setup-context.
            return () => h( 'div' )
        },
    } )

    const root = document.createElement( 'div' )
    app.mount( root )

    return {
        result,
        unmount: () => app.unmount(),
    }
}
