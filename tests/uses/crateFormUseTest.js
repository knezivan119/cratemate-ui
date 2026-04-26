import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'

const createMutate = vi.fn()
const updateMutate = vi.fn()

vi.mock( 'src/queries/crateQuery', () => ( {
    useCreateCrate: () => ( {
        mutateAsync: createMutate,
    } ),
    useUpdateCrate: () => ( {
        mutateAsync: updateMutate,
    } ),
} ) )

import { useCrateForm } from 'src/uses/crateFormUse'
import { withSetup } from '../helpers/withSetupHelper'

describe( 'crateFormUse', () => {
    let harness, crateRef, parentRef, onSaved

    beforeEach( () => {
        createMutate.mockReset()
        updateMutate.mockReset()
        crateRef  = ref( null )
        parentRef = ref( null )
        onSaved   = vi.fn()
        harness = withSetup( () => useCrateForm( {
            crate:    crateRef,
            parentId: parentRef,
            onSaved,
        } ) )
    } )

    afterEach( () => {
        harness.unmount()
    } )

    it( 'initial state empty when crate is null', () => {
        const { form, saving, errorMessage } = harness.result
        expect( form.name ).toBe( '' )
        expect( form.type ).toBeNull()
        expect( form.description ).toBe( '' )
        expect( saving.value ).toBe( false )
        expect( errorMessage.value ).toBeNull()
    } )

    it( 'form syncs when crate ref becomes populated', async () => {
        const { form } = harness.result
        crateRef.value = {
            id:          'x',
            name:        'Garage',
            type:        'room',
            description: 'cars',
        }
        await nextTick()

        expect( form.name ).toBe( 'Garage' )
        expect( form.type ).toBe( 'room' )
        expect( form.description ).toBe( 'cars' )
    } )

    it( 'submit creates a new crate when no existing crate is given', async () => {
        createMutate.mockResolvedValue( {
            data: {
                id:   'new-id',
                name: 'Drawer',
            },
        } )
        parentRef.value = 'parent-id'

        const { form, submit } = harness.result
        form.name = 'Drawer'
        form.type = 'crate'

        await submit()

        expect( createMutate ).toHaveBeenCalledWith( {
            name:        'Drawer',
            type:        'crate',
            description: '',
            parent_id:   'parent-id',
        } )
        expect( updateMutate ).not.toHaveBeenCalled()
        expect( onSaved ).toHaveBeenCalledWith( {
            id:   'new-id',
            name: 'Drawer',
        } )
    } )

    it( 'submit updates the existing crate when one is given', async () => {
        crateRef.value = {
            id:          'edit-id',
            name:        'Old',
            type:        'room',
            description: '',
        }
        await nextTick()
        updateMutate.mockResolvedValue( {
            data: {
                id:   'edit-id',
                name: 'New',
            },
        } )

        const { form, submit } = harness.result
        form.name = 'New'

        await submit()

        expect( updateMutate ).toHaveBeenCalledWith( {
            id: 'edit-id',
            payload: expect.objectContaining( {
                name: 'New',
                type: 'room',
            } ),
        } )
        expect( createMutate ).not.toHaveBeenCalled()
        expect( onSaved ).toHaveBeenCalledWith( {
            id:   'edit-id',
            name: 'New',
        } )
    } )

    it( 'submit failure sets errorMessage and does not call onSaved', async () => {
        createMutate.mockRejectedValue( {
            body: {
                error: {
                    message: 'Validation failed',
                },
            },
        } )

        const { submit, errorMessage } = harness.result
        await submit()

        expect( errorMessage.value ).toBe( 'Validation failed' )
        expect( onSaved ).not.toHaveBeenCalled()
    } )

    it( 'submit toggles saving flag around the call', async () => {
        let resolveCreate
        createMutate.mockImplementation( () => new Promise( ( r ) => { resolveCreate = r } ) )

        const { saving, submit } = harness.result
        const p = submit()
        expect( saving.value ).toBe( true )
        resolveCreate( {
            data: {
                id: 'x',
            },
        } )
        await p
        expect( saving.value ).toBe( false )
    } )
} )
