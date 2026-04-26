import { useQuery } from '@tanstack/vue-query'
import { apiFetch } from 'src/boot/api'

export const tagKeys = {
    all:   [ 'tags' ],
    lists: () => [ ...tagKeys.all, 'list' ],
}

// Tags are flat and per-user — fetching all in one call is fine for the foreseeable inventory size.
export function useTagsList () {
    return useQuery( {
        queryKey: tagKeys.lists(),
        queryFn:  () => apiFetch( '/tags?per_page=500' ),
    } )
}
