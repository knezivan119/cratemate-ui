import { computed, unref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from 'src/boot/api'

export const junkKeys = {
    all: [ 'junk' ],
    lists: () => [ ...junkKeys.all, 'list' ],
    list:  ( filters ) => [ ...junkKeys.lists(), filters ],
    inCrate: ( crateId ) => [ ...junkKeys.all, 'in-crate', crateId ],
    details: () => [ ...junkKeys.all, 'detail' ],
    detail:  ( id ) => [ ...junkKeys.details(), id ],
}

export function useJunkList ( page ) {
    return useQuery( {
        queryKey: computed( () => junkKeys.list( { page: page.value } ) ),
        queryFn:  () => apiFetch( `/junk?page=${ page.value }` ),
        placeholderData: ( previous ) => previous,
    } )
}

// Returns junk in a single crate. Used by the capture dialog to derive "Junk #N" by reading meta.total.
// per_page=1 keeps the payload tiny — we only need the count.
export function useJunkInCrate ( crateId ) {
    return useQuery( {
        queryKey: computed( () => junkKeys.inCrate( unref( crateId ) ) ),
        queryFn:  () => apiFetch( `/junk?crate_id=${ unref( crateId ) }&per_page=1` ),
        enabled:  computed( () => !!unref( crateId ) ),
    } )
}

export function useJunk ( id ) {
    return useQuery( {
        queryKey: computed( () => junkKeys.detail( unref( id ) ) ),
        queryFn:  () => apiFetch( `/junk/${ unref( id ) }` ),
        enabled:  computed( () => !!unref( id ) ),
    } )
}

export function useCreateJunk () {
    const qc = useQueryClient()
    return useMutation( {
        mutationFn: ( payload ) => apiFetch( '/junk', {
            method: 'POST',
            body: JSON.stringify( payload ),
        } ),
        onSuccess: ( res ) => {
            qc.invalidateQueries( { queryKey: junkKeys.lists() } )
            if ( res?.data?.crate_id ) {
                qc.invalidateQueries( { queryKey: junkKeys.inCrate( res.data.crate_id ) } )
            }
        },
    } )
}

export function useUpdateJunk () {
    const qc = useQueryClient()
    return useMutation( {
        mutationFn: ( { id, payload } ) => apiFetch( `/junk/${ id }`, {
            method: 'PATCH',
            body: JSON.stringify( payload ),
        } ),
        onSuccess: ( _data, variables ) => {
            qc.invalidateQueries( { queryKey: junkKeys.lists() } )
            qc.invalidateQueries( { queryKey: junkKeys.detail( variables.id ) } )
        },
    } )
}

export function useDeleteJunk () {
    const qc = useQueryClient()
    return useMutation( {
        mutationFn: ( id ) => apiFetch( `/junk/${ id }`, { method: 'DELETE' } ),
        onSuccess: () => {
            qc.invalidateQueries( { queryKey: junkKeys.lists() } )
        },
    } )
}

export function useUploadJunkPhoto () {
    const qc = useQueryClient()
    return useMutation( {
        mutationFn: ( { junkId, blob, fileName = 'capture.webp' } ) => {
            const formData = new FormData()
            formData.append( 'photo', blob, fileName )
            return apiFetch( `/junk/${ junkId }/photos`, {
                method: 'POST',
                body: formData,
            } )
        },
        onSuccess: ( _data, variables ) => {
            qc.invalidateQueries( { queryKey: junkKeys.lists() } )
            qc.invalidateQueries( { queryKey: junkKeys.detail( variables.junkId ) } )
        },
    } )
}

export function useDeleteJunkPhoto () {
    const qc = useQueryClient()
    return useMutation( {
        mutationFn: ( { junkId, photoId } ) => apiFetch(
            `/junk/${ junkId }/photos/${ photoId }`,
            { method: 'DELETE' },
        ),
        onSuccess: ( _data, variables ) => {
            qc.invalidateQueries( { queryKey: junkKeys.detail( variables.junkId ) } )
            qc.invalidateQueries( { queryKey: junkKeys.lists() } )
        },
    } )
}
