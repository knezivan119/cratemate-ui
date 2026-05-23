import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useJunkInfinite } from 'src/queries/junkQuery'
import JunkPreviewDialog from 'src/components/junk/JunkPreviewDialog.vue'

// Drives the flat /junk gallery: server-paginated infinite list, click-to-preview
// (dialog), edit-to-page, plus the "Load more" action. Pages and dialog
// orchestration live here so the SFC stays a thin template.
export function useJunkList () {
    const $q     = useQuasar()
    const router = useRouter()

    const {
        data,
        error,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useJunkInfinite()

    const items = computed( () =>
        ( data.value?.pages ?? [] ).flatMap( ( p ) => p.data ?? [] ),
    )

    const totalLoaded = computed( () => items.value.length )

    const totalCount = computed( () => {
        const pages = data.value?.pages
        if ( !pages || pages.length === 0 ) return 0
        return pages[ pages.length - 1 ]?.meta?.total ?? 0
    } )

    const initialLoading = computed( () =>
        isFetching.value && totalLoaded.value === 0,
    )
    const loadingMore = computed( () => isFetchingNextPage.value )
    const hasMore     = computed( () => !!hasNextPage.value )

    function loadMore () {
        if ( hasMore.value && !loadingMore.value ) {
            fetchNextPage()
        }
    }

    function openPreview ( item ) {
        $q.dialog( {
            component: JunkPreviewDialog,
            componentProps: {
                junkId: item.id,
            },
        } )
    }

    function openEdit ( item ) {
        router.push( `/junk/${ item.id }` )
    }

    return {
        items,
        totalLoaded,
        totalCount,
        initialLoading,
        loadingMore,
        hasMore,
        error,
        loadMore,
        openPreview,
        openEdit,
    }
}
