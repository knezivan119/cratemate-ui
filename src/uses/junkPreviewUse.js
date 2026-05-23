import { computed } from 'vue'
import { useJunk } from 'src/queries/junkQuery'
import { useCrate } from 'src/queries/crateQuery'

// Read-only data for the preview surface: the junk, its parent crate, and
// the photos collection. The /junk/:id show endpoint is intentionally lean —
// it does not embed the parent crate — so we fetch the crate separately by id.
// Vue Query dedupes both fetches across other consumers.
export function useJunkPreview ( junkId ) {
    const {
        data: junkData,
        error: loadError,
        isLoading: loading,
    } = useJunk( junkId )

    const junk = computed( () => junkData.value?.data )

    const crateIdRef = computed( () => junk.value?.crate_id )
    const { data: crateData } = useCrate( crateIdRef )
    const crate = computed( () => crateData.value?.data )

    const photos = computed( () => junk.value?.photos ?? [] )
    const tags   = computed( () => junk.value?.tags   ?? [] )

    return {
        junk,
        crate,
        photos,
        tags,
        loading,
        loadError,
    }
}
