import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'

const crateData     = ref( null )
const crateError    = ref( null )
const childrenData  = ref( {
    data: [],
} )
const childrenError = ref( null )
const junkData      = ref( {
    data: [],
} )
const junkLoading   = ref( false )
const junkError     = ref( null )

const updateMutate  = vi.fn()
const deleteMutate  = vi.fn()
const routerReplace = vi.fn()

let lastDialogConfig   = null
let dialogOnOkCallback = null
const $qDialog = vi.fn( ( cfg ) => {
    lastDialogConfig = cfg
    return {
        onOk: ( fn ) => {
            dialogOnOkCallback = fn
            return {
                onOk: vi.fn(),
            }
        },
    }
} )
const $qNotify = vi.fn()

vi.mock( 'src/queries/crateQuery', () => ( {
    useCrate: () => ( {
        data:  crateData,
        error: crateError,
    } ),
    useCrateChildren: () => ( {
        data:  childrenData,
        error: childrenError,
    } ),
    useUpdateCrate: () => ( {
        mutateAsync: updateMutate,
    } ),
    useDeleteCrate: () => ( {
        mutateAsync: deleteMutate,
    } ),
} ) )

vi.mock( 'src/queries/junkQuery', () => ( {
    useJunkListInCrate: () => ( {
        data:      junkData,
        isLoading: junkLoading,
        error:     junkError,
    } ),
} ) )

vi.mock( 'vue-router', () => ( {
    useRouter: () => ( {
        replace: routerReplace,
    } ),
} ) )

vi.mock( 'quasar', () => ( {
    useQuasar: () => ( {
        dialog: $qDialog,
        notify: $qNotify,
    } ),
} ) )

vi.mock( 'src/components/crate/CrateFormDialog.vue', () => ( {
    default: {
        name: 'CrateFormDialog',
    },
} ) )
vi.mock( 'src/components/crate/CratePickerDialog.vue', () => ( {
    default: {
        name: 'CratePickerDialog',
    },
} ) )
vi.mock( 'src/components/junk/JunkCaptureDialog.vue', () => ( {
    default: {
        name: 'JunkCaptureDialog',
    },
} ) )

import { useCrateEdit } from 'src/uses/crateEditUse'
import { withSetup } from '../helpers/withSetupHelper'

describe( 'crateEditUse', () => {
    let harness, crateIdRef

    beforeEach( () => {
        crateData.value     = null
        crateError.value    = null
        childrenData.value  = {
            data: [],
        }
        childrenError.value = null
        junkData.value      = {
            data: [],
        }
        junkError.value     = null
        updateMutate.mockReset()
        deleteMutate.mockReset()
        routerReplace.mockReset()
        $qDialog.mockClear()
        $qNotify.mockClear()
        lastDialogConfig   = null
        dialogOnOkCallback = null

        crateIdRef = ref( 'crate-1' )
        harness = withSetup( () => useCrateEdit( crateIdRef ) )
    } )

    afterEach( () => {
        harness.unmount()
    } )

    it( 'parentRoute is /crates when no parent', async () => {
        crateData.value = {
            data: {
                id:        'crate-1',
                name:      'Root',
                parent_id: null,
            },
        }
        await nextTick()
        expect( harness.result.parentRoute.value ).toBe( '/crates' )
    } )

    it( 'parentRoute points to parent crate page when crate has a parent', async () => {
        crateData.value = {
            data: {
                id:        'crate-1',
                name:      'Sub',
                parent_id: 'parent-x',
            },
        }
        await nextTick()
        expect( harness.result.parentRoute.value ).toBe( '/crates/parent-x' )
    } )

    it( 'loadError surfaces any of the three query errors', async () => {
        crateError.value = {
            message: 'crate gone',
        }
        await nextTick()
        expect( harness.result.loadError.value ).toEqual( {
            message: 'crate gone',
        } )
    } )

    it( 'openAddCrate opens the form dialog with parentId of current crate', () => {
        harness.result.openAddCrate()
        expect( lastDialogConfig ).toMatchObject( {
            component: {
                name: 'CrateFormDialog',
            },
            componentProps: {
                parentId: 'crate-1',
            },
        } )
    } )

    it( 'openAddJunk is a no-op when crate not yet loaded', () => {
        harness.result.openAddJunk()
        expect( $qDialog ).not.toHaveBeenCalled()
    } )

    it( 'openAddJunk opens capture dialog with crate context once loaded', async () => {
        crateData.value = {
            data: {
                id:   'crate-1',
                name: 'Garage',
            },
        }
        await nextTick()
        harness.result.openAddJunk()
        expect( lastDialogConfig ).toMatchObject( {
            component: {
                name: 'JunkCaptureDialog',
            },
            componentProps: {
                crateId:   'crate-1',
                crateName: 'Garage',
            },
        } )
    } )

    it( 'openMove opens picker; on OK with a different crate updates parent_id', async () => {
        crateData.value = {
            data: {
                id:        'crate-1',
                name:      'X',
                parent_id: 'old',
            },
        }
        await nextTick()
        updateMutate.mockResolvedValue( {} )

        harness.result.openMove()
        expect( lastDialogConfig.component.name ).toBe( 'CratePickerDialog' )
        await dialogOnOkCallback( {
            id: 'new-parent',
        } )

        expect( updateMutate ).toHaveBeenCalledWith( {
            id: 'crate-1',
            payload: {
                parent_id: 'new-parent',
            },
        } )
    } )

    it( 'openMove ignores picking the same crate as itself', async () => {
        crateData.value = {
            data: {
                id: 'crate-1',
            },
        }
        await nextTick()

        harness.result.openMove()
        await dialogOnOkCallback( {
            id: 'crate-1',
        } )

        expect( updateMutate ).not.toHaveBeenCalled()
    } )

    it( 'moveToRoot calls updateCrate with null parent_id', async () => {
        crateData.value = {
            data: {
                id:        'crate-1',
                parent_id: 'p',
            },
        }
        await nextTick()
        updateMutate.mockResolvedValue( {} )

        await harness.result.moveToRoot()
        expect( updateMutate ).toHaveBeenCalledWith( {
            id: 'crate-1',
            payload: {
                parent_id: null,
            },
        } )
    } )

    it( 'moveToRoot is a no-op when crate is already root', async () => {
        crateData.value = {
            data: {
                id:        'crate-1',
                parent_id: null,
            },
        }
        await nextTick()
        await harness.result.moveToRoot()
        expect( updateMutate ).not.toHaveBeenCalled()
    } )

    it( 'confirmDelete opens dialog; on OK deletes and replaces route', async () => {
        crateData.value = {
            data: {
                id:        'crate-1',
                name:      'Bin',
                parent_id: null,
            },
        }
        await nextTick()
        deleteMutate.mockResolvedValue( {} )

        harness.result.confirmDelete()
        expect( $qDialog ).toHaveBeenCalled()
        await dialogOnOkCallback()

        expect( deleteMutate ).toHaveBeenCalledWith( 'crate-1' )
        expect( routerReplace ).toHaveBeenCalledWith( '/crates' )
    } )

    it( 'confirmDelete after delete navigates to parent if one exists', async () => {
        crateData.value = {
            data: {
                id:        'crate-1',
                name:      'Bin',
                parent_id: 'parent-x',
            },
        }
        await nextTick()
        deleteMutate.mockResolvedValue( {} )

        harness.result.confirmDelete()
        await dialogOnOkCallback()

        expect( routerReplace ).toHaveBeenCalledWith( '/crates/parent-x' )
    } )

    it( 'delete failure notifies but does not navigate', async () => {
        crateData.value = {
            data: {
                id:        'crate-1',
                name:      'Bin',
                parent_id: null,
            },
        }
        await nextTick()
        deleteMutate.mockRejectedValue( {
            body: {
                error: {
                    message: 'denied',
                },
            },
        } )

        harness.result.confirmDelete()
        await dialogOnOkCallback()

        expect( $qNotify ).toHaveBeenCalledWith( expect.objectContaining( {
            color:   'negative',
            message: 'denied',
        } ) )
        expect( routerReplace ).not.toHaveBeenCalled()
    } )
} )
