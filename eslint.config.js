import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import pluginQuasar from '@quasar/app-vite/eslint'

export default [
    {
    /**
     * Ignore the following files.
     * Please note that pluginQuasar.configs.recommended() already ignores
     * the "node_modules" folder for you (and all other Quasar project
     * relevant folders and files).
     *
     * ESLint requires "ignores" key to be the only one in this object
     */
    // ignores: []
    },

    ...pluginQuasar.configs.recommended(),
    js.configs.recommended,

    /**
   * https://eslint.vuejs.org
   *
   * pluginVue.configs.base
   *   -> Settings and rules to enable correct ESLint parsing.
   * pluginVue.configs[ 'flat/essential']
   *   -> base, plus rules to prevent errors or unintended behavior.
   * pluginVue.configs["flat/strongly-recommended"]
   *   -> Above, plus rules to considerably improve code readability and/or dev experience.
   * pluginVue.configs["flat/recommended"]
   *   -> Above, plus rules to enforce subjective community defaults to ensure consistency.
   */
    ...pluginVue.configs[ 'flat/essential' ],

    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',

            globals: {
                ...globals.browser,
                ...globals.node, // SSR, Electron, config files
                process: 'readonly', // process.env.*
                ga: 'readonly', // Google Analytics
                cordova: 'readonly',
                Capacitor: 'readonly',
                chrome: 'readonly', // BEX related
                browser: 'readonly', // BEX related
            },
        },

        rules: {

            // allow async-await
            'generator-star-spacing': 'off',
            // allow paren-less arrow functions
            //    'arrow-parens': 'off',
            //    'one-var': 'off',
            //    'no-void': 'off',
            //    'multiline-ternary': 'off',
            //
            //    'import/first': 'off',
            //    'import/named': 'error',
            //    'import/namespace': 'error',
            //    'import/default': 'error',
            //    'import/export': 'error',
            //    'import/extensions': 'off',
            //    'import/no-unresolved': 'off',
            //    'import/no-extraneous-dependencies': 'off',
            //
            //    'prefer-promise-reject-errors': 'off',

            // allow debugger during development only
            // 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

            // 'import/extensions': [ 'warn', 'always' ],
            'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'quotes': [ 'warn', 'single' ],
            'semi': [ 'warn', 'never' ],
            'brace-style': [ 'warn', 'stroustrup' ],
            'block-spacing': [ 'warn', 'always' ],
            'comma-dangle': [ 'warn', 'always-multiline' ],
            'comma-spacing': [ 'warn', {
                before: false,
                after: true,
            } ],
            'computed-property-spacing': [ 'warn', 'always' ],
            'indent': [ 'warn', 4, {
                SwitchCase: 1,
                ArrayExpression: 1,
                ObjectExpression: 1,
            } ],
            'linebreak-style': [ 'error', 'unix' ],
            'object-curly-spacing': [ 'warn', 'always' ],
            'object-curly-newline': [ 'warn', {
                multiline: true,
                consistent: true,
            } ],
            'object-property-newline': [ 'warn', {
                allowAllPropertiesOnSameLine: true,
            } ],
            'array-bracket-spacing': [ 'warn', 'always' ],
            'space-in-parens': [ 'warn', 'always' ],
            'func-call-spacing': [ 'error', 'never' ],
            'space-infix-ops': [ 'warn', { 'int32Hint': false } ],

            'no-unused-vars': [ 'warn' ],
            'vue/no-v-html': [ 'off' ],
            'vue/html-indent': [ 'warn', 4, {
                baseIndent: 0,
            } ],


            'vue/multi-word-component-names': [ 'error', {
                ignores: [ 'ww', 'qq' ],
            } ],
            'vue/max-attributes-per-line': [ 'warn', {
                singleline: {
                    max: 3,
                },
            } ],
            'vue/html-closing-bracket-spacing': [ 'error', {
                startTag: 'never',
                endTag: 'never',
                selfClosingTag: 'always',
            } ],


            'vue/order-in-components': [ 'error', {
                'order': [
                    'el',
                    'name',
                    'key',
                    'parent',
                    'functional',
                    [ 'delimiters', 'comments' ],
                    [ 'components', 'directives', 'filters' ],
                    'extends',
                    'mixins',
                    [ 'provide', 'inject' ],
                    'ROUTER_GUARDS',
                    'layout',
                    'middleware',
                    'validate',
                    'scrollToTop',
                    'transition',
                    'loading',
                    'inheritAttrs',
                    'model',
                    [ 'props', 'propsData' ],
                    'emits',
                    'setup',
                    'asyncData',
                    'data',
                    'fetch',
                    'head',
                    'watch',
                    'computed',
                    'watchQuery',
                    'methods',
                    [ 'template', 'render' ],
                    'renderError',
                    'LIFECYCLE_HOOKS',
                ],
            } ],

        },
        // add your custom rules here
        // rules: {
        //   'prefer-promise-reject-errors': 'off',

    //   // allow debugger during development only
    //   'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    // }
    },

    {
        files: [ 'src-pwa/custom-service-worker.js' ],
        languageOptions: {
            globals: {
                ...globals.serviceworker,
            },
        },
    },
]
