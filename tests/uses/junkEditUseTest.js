import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'

const junkData    = ref( null )
const junkError   = ref( null )
const crateData   = ref( null )
const crateError  = ref( null )
const tagsData    = ref( { data: [] } )
const tagsLoading = ref( false )

const updateMutate = vi.fn()
const deleteMutate = vi.fn()

const dialogOnOk = vi.fn()
const $qDialog   = vi.fn( () => ( { onOk: ( fn ) => { dialogOnOk.mockImplementation( fn ); return { onOk: dialogOnOk } } } ) )

vi.mock( 'src/queries/junkQuery', () => ( {
    useJunk:       () => ( { data: junkData,  error: junkError } ),
    useUpdateJunk: () => ( { mutateAsync: updateMutate } ),
    useDeleteJunk: () => ( { mutateAsync: deleteMutate } ),
} ) )

vi.mock( 'src/queries/crateQuery', () => ( {
    useCrate: () => ( { data: crateData, error: crateError } ),
} ) )

vi.mock( 'src/queries/tagQuery', () => ( {
    useTagsList: () => ( { data: tagsData, isLoading: tagsLoading } ),
} ) )

vi.mock( 'quasar', () => ( {
    useQuasar: () => ( { dialog: $qDialog } ),
} ) )

vi.mock( 'src/components/CratePickerDialog.vue', () => ( { default: { name: 'CratePickerDialog' } } ) )

import { useJunkEdit } from 'src/uses/junkEditUse'
import { withSetup } from '../helpers/withSetupHelper'

describe( 'junkEditUse', () => {
    let harness, junkIdRef

    beforeEach( () => {
        junkData.value   = null
        crateData.value  = null
        tagsData.value   = { data: [] }
        updateMutate.mockReset()
        deleteMutate.mockReset()
        $qDialog.mockClear()

        junkIdRef = ref( 'junk-1' )
        harness = withSetup( () => useJunkEdit( junkIdRef ) )
    } )

    afterEach( () => {
        harness.unmount()
    } )

    it( 'form syncs from junk when query resolves', async () => {
        junkData.value = {
            data: {
                id:          'junk-1',
                name:        'Hammer',
                description: 'claw, 16oz',
                quantity:    2,
                unit:        'ea',
                tags:        [ { id: 't1' } ],
                crate_id:    'c1',
            },
        }
        await nextTick()

        const { form } = harness.result
        expect( form.value.name ).toBe( 'Hammer' )
        expect( form.value.quantity ).toBe( 2 )
        expect( form.value.tags ).toEqual( [ 't1' ] )
        expect( form.value.crate_id ).toBe( 'c1' )
    } )

    it( 'isDirty is false when form matches server state', async () => {
        junkData.value = {
            data: { id: 'junk-1', name: 'X', description: '', quantity: 1, unit: 'ea', tags: [], crate_id: 'c1' },
        }
        await nextTick()
        expect( harness.result.isDirty.value ).toBe( false )
    } )

    it( 'isDirty becomes true after editing the form', async () => {
        junkData.value = {
            data: { id: 'junk-1', name: 'X', description: '', quantity: 1, unit: 'ea', tags: [], crate_id: 'c1' },
        }
        await nextTick()
        harness.result.form.value.name = 'X-edited'
        await nextTick()
        expect( harness.result.isDirty.value ).toBe( true )
    } )

    it( 'tagOptions maps the tags response into label/value pairs', () => {
        tagsData.value = { data: [ { id: 't1', name: 'metal' }, { id: 't2', name: 'tools' } ] }
        const { tagOptions } = harness.result
        expect( tagOptions.value ).toEqual( [
            { label: 'metal', value: 't1' },
            { label: 'tools', value: 't2' },
        ] )
    } )

    it( 'onSave sends the current form as payload', async () => {
        updateMutate.mockResolvedValue( {} )
        junkData.value = {
            data: { id: 'junk-1', name: 'X', description: '', quantity: 1, unit: 'ea', tags: [], crate_id: 'c1' },
        }
        await nextTick()
        harness.result.form.value.name = 'Renamed'
        await harness.result.onSave()

        expect( updateMutate ).toHaveBeenCalledWith( {
            id:      'junk-1',
            payload: expect.objectContaining( { name: 'Renamed' } ),
        } )
    } )

    it( 'onSave failure sets errorMessage', async () => {
        updateMutate.mockRejectedValue( { body: { error: { message: 'nope' } } } )
        await harness.result.onSave()
        expect( harness.result.errorMessage.value ).toBe( 'nope' )
    } )

    it( 'loadError surfaces junk-query errors', async () => {
        junkError.value = { message: 'gone' }
        await nextTick()
        expect( harness.result.loadError.value ).toEqual( { message: 'gone' } )
    } )

    it( 'openCratePicker opens a dialog with the picker component', () => {
        harness.result.openCratePicker()
        expect( $qDialog ).toHaveBeenCalledWith( expect.objectContaining( {
            component: { name: 'CratePickerDialog' },
        } ) )
    } )
} )
