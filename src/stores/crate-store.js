import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from 'src/boot/api'

export const useCrateStore = defineStore( 'crate', () => {
    const crates = ref( [] )
    const meta = ref( { page: 1, per_page: 15, total: 0, last_page: 1 } )
    const loading = ref( false )
    const error = ref( null )

    const hasCrates = computed( () => crates.value.length > 0 )

    async function fetchCrates ( page = 1 ) {
        loading.value = true
        error.value = null
        try {
            const res = await apiFetch( `/crates?page=${page}` )
            crates.value = res.data
            meta.value = res.meta
        }
        catch ( err ) {
            error.value = err.message
        }
        finally {
            loading.value = false
        }
    }

    async function createCrate ( payload ) {
        loading.value = true
        error.value = null
        try {
            const res = await apiFetch( '/crates', {
                method: 'POST',
                body: JSON.stringify( payload ),
            } )
            crates.value.unshift( res.data )
            meta.value.total++
            return res.data
        }
        catch ( err ) {
            error.value = err.message
            throw err
        }
        finally {
            loading.value = false
        }
    }

    async function updateCrate ( id, payload ) {
        loading.value = true
        error.value = null
        try {
            const res = await apiFetch( `/crates/${id}`, {
                method: 'PATCH',
                body: JSON.stringify( payload ),
            } )
            const idx = crates.value.findIndex( ( c ) => c.id === id )
            if ( idx !== -1 ) {
                crates.value[ idx ] = res.data
            }
            return res.data
        }
        catch ( err ) {
            error.value = err.message
            throw err
        }
        finally {
            loading.value = false
        }
    }

    async function deleteCrate ( id ) {
        loading.value = true
        error.value = null
        try {
            await apiFetch( `/crates/${id}`, {
                method: 'DELETE',
            } )
            crates.value = crates.value.filter( ( c ) => c.id !== id )
            meta.value.total--
        }
        catch ( err ) {
            error.value = err.message
            throw err
        }
        finally {
            loading.value = false
        }
    }

    return {
        crates,
        meta,
        loading,
        error,
        hasCrates,
        fetchCrates,
        createCrate,
        updateCrate,
        deleteCrate,
    }
} )
