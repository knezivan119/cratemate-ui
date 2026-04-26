import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname( fileURLToPath( import.meta.url ) )

export default defineConfig( {
    plugins: [ vue() ],
    resolve: {
        alias: {
            src: resolve( __dirname, 'src' ),
        },
    },
    test: {
        environment: 'happy-dom',
        include: [ 'tests/**/*Test.js' ],
        globals: false,
    },
} )
