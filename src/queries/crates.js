import { computed, unref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from 'src/boot/api'

export const crateKeys = {
    all: [ 'crates' ],
    lists:    () => [ ...crateKeys.all, 'list' ],
    list:     ( filters ) => [ ...crateKeys.lists(), filters ],
    children: ( parentId ) => [ ...crateKeys.all, 'children', parentId ?? 'root' ],
    details:  () => [ ...crateKeys.all, 'detail' ],
    detail:   ( id ) => [ ...crateKeys.details(), id ],
}

function buildQuery ( params ) {
    const search = new URLSearchParams()
    for ( const [ k, v ] of Object.entries( params ) ) {
        if ( v !== undefined && v !== null ) search.set( k, v )
    }
    const s = search.toString()
    return s ? `?${ s }` : ''
}

// Fetches direct children of `parentId`. Pass `null` for root crates.
// `parentId` may be a ref or a plain value.
export function useCrateChildren ( parentId ) {
    return useQuery( {
        queryKey: computed( () => crateKeys.children( unref( parentId ) ) ),
        queryFn:  () => apiFetch( `/crates${ buildQuery( {
            parent_id: unref( parentId ) ?? 'null',
            per_page:  100,
        } ) }` ),
        placeholderData: ( previous ) => previous,
    } )
}

export function useCrate ( id ) {
    return useQuery( {
        queryKey: computed( () => crateKeys.detail( unref( id ) ) ),
        queryFn:  () => apiFetch( `/crates/${ unref( id ) }` ),
        enabled:  computed( () => !!unref( id ) ),
    } )
}

export function useCreateCrate () {
    const qc = useQueryClient()
    return useMutation( {
        mutationFn: ( payload ) => apiFetch( '/crates', {
            method: 'POST',
            body:   JSON.stringify( payload ),
        } ),
        onSuccess: ( res ) => {
            const parentId = res?.data?.parent_id ?? null
            qc.invalidateQueries( { queryKey: crateKeys.children( parentId ) } )
            qc.invalidateQueries( { queryKey: crateKeys.lists() } )
        },
    } )
}

export function useUpdateCrate () {
    const qc = useQueryClient()
    return useMutation( {
        mutationFn: ( { id, payload } ) => apiFetch( `/crates/${ id }`, {
            method: 'PATCH',
            body:   JSON.stringify( payload ),
        } ),
        onSuccess: ( _data, variables ) => {
            qc.invalidateQueries( { queryKey: crateKeys.all } )
            qc.invalidateQueries( { queryKey: crateKeys.detail( variables.id ) } )
        },
    } )
}

export function useDeleteCrate () {
    const qc = useQueryClient()
    return useMutation( {
        mutationFn: ( id ) => apiFetch( `/crates/${ id }`, { method: 'DELETE' } ),
        onSuccess: () => {
            qc.invalidateQueries( { queryKey: crateKeys.all } )
        },
    } )
}
