import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'

const data               = ref( null )
const error              = ref( null )
const isFetching         = ref( false )
const isFetchingNextPage = ref( false )
const hasNextPage        = ref( false )
const fetchNextPage      = vi.fn()

const routerPush = vi.fn()
const $qDialog   = vi.fn()

vi.mock( 'src/queries/junkQuery', () => ( {
    useJunkInfinite: () => ( {
        data,
        error,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } ),
} ) )

vi.mock( 'vue-router', () => ( {
    useRouter: () => ( {
        push: routerPush,
    } ),
} ) )

vi.mock( 'quasar', () => ( {
    useQuasar: () => ( {
        dialog: $qDialog,
    } ),
} ) )

vi.mock( 'src/components/junk/JunkPreviewDialog.vue', () => ( {
    default: {
        name: 'JunkPreviewDialog',
    },
} ) )

import { useJunkList } from 'src/uses/junkListUse'
import { withSetup }   from '../helpers/withSetupHelper'

describe( 'junkListUse', () => {
    let harness

    beforeEach( () => {
        data.value               = null
        error.value              = null
        isFetching.value         = false
        isFetchingNextPage.value = false
        hasNextPage.value        = false
        fetchNextPage.mockClear()
        routerPush.mockClear()
        $qDialog.mockClear()

        harness = withSetup( () => useJunkList() )
    } )

    afterEach( () => {
        harness.unmount()
    } )

    it( 'items is empty before any pages arrive', () => {
        expect( harness.result.items.value ).toEqual( [] )
        expect( harness.result.totalLoaded.value ).toBe( 0 )
        expect( harness.result.totalCount.value ).toBe( 0 )
    } )

    it( 'flattens data.pages into a single items array', () => {
        data.value = {
            pages: [
                {
                    data: [
                        { id: 'a' },
                        { id: 'b' },
                    ],
                    meta: { total: 5 },
                },
                {
                    data: [
                        { id: 'c' },
                    ],
                    meta: { total: 5 },
                },
            ],
        }

        expect( harness.result.items.value.map( ( i ) => i.id ) ).toEqual( [ 'a', 'b', 'c' ] )
        expect( harness.result.totalLoaded.value ).toBe( 3 )
        expect( harness.result.totalCount.value ).toBe( 5 )
    } )

    it( 'initialLoading reflects fetching with no items yet', () => {
        isFetching.value = true
        expect( harness.result.initialLoading.value ).toBe( true )

        data.value = {
            pages: [
                { data: [ { id: 'a' } ], meta: { total: 1 } },
            ],
        }
        expect( harness.result.initialLoading.value ).toBe( false )
    } )

    it( 'hasMore mirrors hasNextPage', () => {
        expect( harness.result.hasMore.value ).toBe( false )
        hasNextPage.value = true
        expect( harness.result.hasMore.value ).toBe( true )
    } )

    it( 'loadMore calls fetchNextPage when more is available', () => {
        hasNextPage.value = true
        harness.result.loadMore()
        expect( fetchNextPage ).toHaveBeenCalledTimes( 1 )
    } )

    it( 'loadMore is a no-op when no more pages', () => {
        hasNextPage.value = false
        harness.result.loadMore()
        expect( fetchNextPage ).not.toHaveBeenCalled()
    } )

    it( 'loadMore is a no-op while a fetch is already in flight', () => {
        hasNextPage.value        = true
        isFetchingNextPage.value = true
        harness.result.loadMore()
        expect( fetchNextPage ).not.toHaveBeenCalled()
    } )

    it( 'openEdit routes to the junk detail page', () => {
        harness.result.openEdit( { id: 'xyz' } )
        expect( routerPush ).toHaveBeenCalledWith( '/junk/xyz' )
    } )

    it( 'openPreview launches JunkPreviewDialog with the junk id', () => {
        harness.result.openPreview( { id: 'xyz' } )
        expect( $qDialog ).toHaveBeenCalledTimes( 1 )
        const cfg = $qDialog.mock.calls[ 0 ][ 0 ]
        expect( cfg.componentProps ).toEqual( {
            junkId: 'xyz',
        } )
    } )
} )
