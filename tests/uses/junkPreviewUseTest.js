import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'

const junkData    = ref( null )
const junkError   = ref( null )
const junkLoading = ref( false )
const crateData   = ref( null )

vi.mock( 'src/queries/junkQuery', () => ( {
    useJunk: () => ( {
        data:      junkData,
        error:     junkError,
        isLoading: junkLoading,
    } ),
} ) )

vi.mock( 'src/queries/crateQuery', () => ( {
    useCrate: () => ( {
        data: crateData,
    } ),
} ) )

import { useJunkPreview } from 'src/uses/junkPreviewUse'
import { withSetup }      from '../helpers/withSetupHelper'

describe( 'junkPreviewUse', () => {
    let harness

    beforeEach( () => {
        junkData.value    = null
        junkError.value   = null
        junkLoading.value = false
        crateData.value   = null

        const junkIdRef = ref( 'j-1' )
        harness = withSetup( () => useJunkPreview( junkIdRef ) )
    } )

    afterEach( () => {
        harness.unmount()
    } )

    it( 'exposes empty state before junk arrives', () => {
        expect( harness.result.junk.value ).toBeUndefined()
        expect( harness.result.photos.value ).toEqual( [] )
        expect( harness.result.tags.value ).toEqual( [] )
    } )

    it( 'maps junk fields and exposes photos and tags arrays', () => {
        junkData.value = {
            data: {
                id:          'j-1',
                name:        'Hammer',
                quantity:    1,
                unit:        'ea',
                photos:      [ { id: 'p-1' }, { id: 'p-2' } ],
                tags:        [ { id: 't-1', name: 'tools' } ],
                crate_id:    'c-1',
            },
        }

        expect( harness.result.junk.value.name ).toBe( 'Hammer' )
        expect( harness.result.photos.value.map( ( p ) => p.id ) ).toEqual( [ 'p-1', 'p-2' ] )
        expect( harness.result.tags.value.map( ( t ) => t.name ) ).toEqual( [ 'tools' ] )
    } )

    it( 'exposes the parent crate when its query resolves', () => {
        junkData.value = {
            data: {
                id:       'j-1',
                crate_id: 'c-1',
                photos:   [],
            },
        }
        crateData.value = {
            data: {
                id:     'c-1',
                name:   'Garage',
                number: 7,
            },
        }

        expect( harness.result.crate.value ).toEqual( {
            id:     'c-1',
            name:   'Garage',
            number: 7,
        } )
    } )

    it( 'photos and tags are empty arrays when junk omits them', () => {
        junkData.value = {
            data: {
                id: 'j-1',
            },
        }

        expect( harness.result.photos.value ).toEqual( [] )
        expect( harness.result.tags.value ).toEqual( [] )
    } )
} )
