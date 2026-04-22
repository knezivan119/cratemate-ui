import { defineBoot } from '#q-app/wrappers'

const apiUrl = process.env.API_URL || '/api/v1'
const TOKEN_KEY = 'cratemate_token'

async function apiFetch ( path, options = {} ) {
    const url = `${ apiUrl }${ path }`
    const isFormData = options.body instanceof FormData

    const headers = {
        'Accept': 'application/json',
        ...( isFormData ? {} : { 'Content-Type': 'application/json' } ),
        ...options.headers,
    }

    const token = localStorage.getItem( TOKEN_KEY )
    if ( token && !headers.Authorization ) {
        headers.Authorization = `Bearer ${ token }`
    }

    const response = await fetch( url, {
        ...options,
        headers,
    } )

    if ( response.status === 204 ) {
        return null
    }

    const body = await response.json()

    if ( !response.ok ) {
        const error = new Error( body?.error?.message || response.statusText )
        error.status = response.status
        error.body = body
        throw error
    }

    return body
}

export { apiFetch }

export default defineBoot( ( { app } ) => {
    app.config.globalProperties.$api = apiFetch
} )
