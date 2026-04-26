import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'

// Mock the query module before importing the composable so the SUT picks
// up the stub when it imports useCrateChildren.
vi.mock( 'src/queries/crateQuery', () => ( {
    useCrateChildren: vi.fn( () => ( {
        data:      ref( { data: [] } ),
        error:     ref( null ),
        isLoading: ref( false ),
    } ) ),
} ) )

import { useCrateDrilldown } from 'src/uses/crateDrilldownUse'
import { withSetup } from '../helpers/withSetupHelper'

describe( 'crateDrilldownUse', () => {
    let harness

    beforeEach( () => {
        harness = withSetup( () => useCrateDrilldown() )
    } )

    afterEach( () => {
        harness.unmount()
    } )

    it( 'starts at root with empty path', () => {
        const { path, currentEntry, currentId } = harness.result
        expect( path.value ).toEqual( [] )
        expect( currentEntry.value ).toBeNull()
        expect( currentId.value ).toBeNull()
    } )

    it( 'drillInto pushes onto path and updates currentEntry', () => {
        const { drillInto, path, currentEntry, currentId } = harness.result
        drillInto( { id: 'a', name: 'House', type: 'location' } )
        expect( path.value ).toHaveLength( 1 )
        expect( currentEntry.value ).toEqual( { id: 'a', name: 'House', type: 'location' } )
        expect( currentId.value ).toBe( 'a' )

        drillInto( { id: 'b', name: 'Garage', type: 'room' } )
        expect( path.value ).toHaveLength( 2 )
        expect( currentEntry.value.id ).toBe( 'b' )
    } )

    it( 'goUp pops the last entry', () => {
        const { drillInto, goUp, path, currentEntry } = harness.result
        drillInto( { id: 'a', name: 'House', type: 'location' } )
        drillInto( { id: 'b', name: 'Garage', type: 'room' } )

        goUp()
        expect( path.value ).toHaveLength( 1 )
        expect( currentEntry.value.id ).toBe( 'a' )

        goUp()
        expect( path.value ).toHaveLength( 0 )
        expect( currentEntry.value ).toBeNull()
    } )

    it( 'goUp at root is a no-op', () => {
        const { goUp, path } = harness.result
        goUp()
        expect( path.value ).toEqual( [] )
    } )

    it( 'goToDepth truncates path at the given index', () => {
        const { drillInto, goToDepth, path } = harness.result
        drillInto( { id: 'a', name: 'A' } )
        drillInto( { id: 'b', name: 'B' } )
        drillInto( { id: 'c', name: 'C' } )

        goToDepth( 0 )
        expect( path.value.map( ( e ) => e.id ) ).toEqual( [ 'a' ] )
    } )

    it( 'reset clears the entire path', () => {
        const { drillInto, reset, path, currentEntry } = harness.result
        drillInto( { id: 'a', name: 'A' } )
        drillInto( { id: 'b', name: 'B' } )

        reset()
        expect( path.value ).toEqual( [] )
        expect( currentEntry.value ).toBeNull()
    } )
} )
