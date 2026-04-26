import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const routerReplace = vi.fn()
const authLogin     = vi.fn()
const routeRef = {
    query: {},
}

vi.mock( 'vue-router', () => ( {
    useRouter: () => ( {
        replace: routerReplace,
    } ),
    useRoute: () => routeRef,
} ) )

vi.mock( 'src/stores/authStore', () => ( {
    useAuthStore: () => ( {
        login: authLogin,
    } ),
} ) )

import { useLogin } from 'src/uses/loginUse'
import { withSetup } from '../helpers/withSetupHelper'

describe( 'loginUse', () => {
    let harness

    beforeEach( () => {
        routerReplace.mockReset()
        authLogin.mockReset()
        routeRef.query = {}
        harness = withSetup( () => useLogin() )
    } )

    afterEach( () => {
        harness.unmount()
    } )

    it( 'initial state has empty form, idle flags', () => {
        const { form, loading, errorMessage } = harness.result
        expect( form.email ).toBe( '' )
        expect( form.password ).toBe( '' )
        expect( loading.value ).toBe( false )
        expect( errorMessage.value ).toBeNull()
    } )

    it( 'submit calls authStore.login with form contents', async () => {
        authLogin.mockResolvedValue()
        const { form, submit } = harness.result
        form.email    = 'a@b.com'
        form.password = 'secret'

        await submit()

        expect( authLogin ).toHaveBeenCalledWith( form )
    } )

    it( 'submit on success redirects to "/" when no redirect query', async () => {
        authLogin.mockResolvedValue()
        await harness.result.submit()
        expect( routerReplace ).toHaveBeenCalledWith( '/' )
    } )

    it( 'submit on success redirects to query.redirect when present', async () => {
        authLogin.mockResolvedValue()
        routeRef.query = {
            redirect: '/junk/123',
        }
        await harness.result.submit()
        expect( routerReplace ).toHaveBeenCalledWith( '/junk/123' )
    } )

    it( 'submit failure sets errorMessage and does not redirect', async () => {
        authLogin.mockRejectedValue( {
            body: {
                error: {
                    message: 'Bad creds',
                },
            },
        } )
        const { submit, errorMessage } = harness.result
        await submit()

        expect( errorMessage.value ).toBe( 'Bad creds' )
        expect( routerReplace ).not.toHaveBeenCalled()
    } )

    it( 'loading flips true during submit and false after', async () => {
        let resolveLogin
        authLogin.mockImplementation( () => new Promise( ( r ) => { resolveLogin = r } ) )

        const { loading, submit } = harness.result
        const p = submit()
        expect( loading.value ).toBe( true )
        resolveLogin()
        await p
        expect( loading.value ).toBe( false )
    } )
} )
