import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from 'src/boot/api'

const TOKEN_KEY = 'cratemate_token'
const USER_KEY  = 'cratemate_user'

function readStoredUser () {
    const raw = localStorage.getItem( USER_KEY )
    if ( !raw ) return null
    try {
        return JSON.parse( raw )
    }
    catch {
        return null
    }
}

export const useAuthStore = defineStore( 'auth', () => {
    const token = ref( localStorage.getItem( TOKEN_KEY ) )
    const user  = ref( readStoredUser() )

    const isAuthenticated = computed( () => !!token.value )

    function setSession ( newToken, newUser ) {
        token.value = newToken
        user.value  = newUser
        localStorage.setItem( TOKEN_KEY, newToken )
        localStorage.setItem( USER_KEY, JSON.stringify( newUser ) )
    }

    function clearSession () {
        token.value = null
        user.value  = null
        localStorage.removeItem( TOKEN_KEY )
        localStorage.removeItem( USER_KEY )
    }

    async function login ( credentials ) {
        const res = await apiFetch( '/login', {
            method: 'POST',
            body: JSON.stringify( credentials ),
        } )
        setSession( res.data.token, res.data.user )
        return res.data.user
    }

    async function register ( payload ) {
        const res = await apiFetch( '/register', {
            method: 'POST',
            body: JSON.stringify( payload ),
        } )
        setSession( res.data.token, res.data.user )
        return res.data.user
    }

    async function logout () {
        try {
            await apiFetch( '/logout', { method: 'POST' } )
        }
        catch {
            // best effort; local session is cleared regardless
        }
        clearSession()
    }

    return {
        token,
        user,
        isAuthenticated,
        login,
        register,
        logout,
        setSession,
        clearSession,
    }
} )
