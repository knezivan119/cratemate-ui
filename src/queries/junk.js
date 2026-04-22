import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from 'src/boot/api'

export const junkKeys = {
    all: [ 'junk' ],
    lists: () => [ ...junkKeys.all, 'list' ],
    list:  ( filters ) => [ ...junkKeys.lists(), filters ],
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

export function useCreateJunk () {
    const qc = useQueryClient()
    return useMutation( {
        mutationFn: ( payload ) => apiFetch( '/junk', {
            method: 'POST',
            body: JSON.stringify( payload ),
        } ),
        onSuccess: () => {
            qc.invalidateQueries( { queryKey: junkKeys.lists() } )
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
