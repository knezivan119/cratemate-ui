import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'

const createMutate  = vi.fn()
const uploadMutate  = vi.fn()
const refetchCount  = vi.fn()
const crateJunkData = ref( {
    meta: {
        total: 3,
    },
} )

const cameraCapture = vi.fn()
const cameraStop    = vi.fn()
const cameraStart   = vi.fn()
const cameraClear   = vi.fn()

vi.mock( 'src/queries/junkQuery', () => ( {
    useCreateJunk: () => ( {
        mutateAsync: createMutate,
    } ),
    useUploadJunkPhoto: () => ( {
        mutateAsync: uploadMutate,
    } ),
    useJunkInCrate: () => ( {
        data:    crateJunkData,
        refetch: refetchCount,
    } ),
} ) )

vi.mock( 'src/uses/cameraUse', () => ( {
    useCamera: () => ( {
        videoEl:            ref( null ),
        streaming:          ref( false ),
        error:              ref( null ),
        devices:            ref( [] ),
        deviceId:           ref( null ),
        supported:          false,
        startCamera:        cameraStart,
        stopCamera:         cameraStop,
        capture:            cameraCapture,
        clearCapture:       cameraClear,
        restartIfStreaming: vi.fn(),
    } ),
} ) )

vi.mock( 'quasar', () => ( {
    useQuasar: () => ( {
        platform: {
            is: {
                mobile: false,
            },
        },
    } ),
} ) )

// jsdom/happy-dom provides URL.createObjectURL but not always revokeObjectURL.
globalThis.URL.createObjectURL = vi.fn( () => 'blob:mock' )
globalThis.URL.revokeObjectURL = vi.fn()

import { useJunkCapture } from 'src/uses/junkCaptureUse'
import { withSetup } from '../helpers/withSetupHelper'

describe( 'junkCaptureUse', () => {
    let harness, crateIdRef, onSaved

    beforeEach( () => {
        createMutate.mockReset()
        uploadMutate.mockReset()
        refetchCount.mockReset().mockResolvedValue()
        cameraCapture.mockReset()
        crateJunkData.value = {
            meta: {
                total: 3,
            },
        }
        onSaved = vi.fn()

        crateIdRef = ref( 'crate-1' )
        harness = withSetup( () => useJunkCapture( {
            crateId: crateIdRef,
            onSaved,
        } ) )
    } )

    afterEach( () => {
        harness.unmount()
    } )

    it( 'autoName uses baseCount + localOffset + 1', () => {
        expect( harness.result.autoName.value ).toBe( 'Junk #4' )
    } )

    it( 'photos starts empty and canSave is false', () => {
        expect( harness.result.photos.value ).toEqual( [] )
        expect( harness.result.canSave.value ).toBe( false )
    } )

    it( 'onCapture appends a photo when below the limit', async () => {
        cameraCapture.mockResolvedValue( new Blob( [ 'x' ] ) )
        await harness.result.onCapture()
        expect( harness.result.photos.value ).toHaveLength( 1 )
        expect( harness.result.canSave.value ).toBe( true )
    } )

    it( 'onCapture is a no-op at MAX_PHOTOS', async () => {
        cameraCapture.mockResolvedValue( new Blob( [ 'x' ] ) )
        for ( let i = 0; i < harness.result.MAX_PHOTOS; i++ ) {
            await harness.result.onCapture()
        }
        expect( harness.result.atPhotoLimit.value ).toBe( true )

        cameraCapture.mockClear()
        await harness.result.onCapture()
        expect( cameraCapture ).not.toHaveBeenCalled()
    } )

    it( 'removePhoto removes by index and revokes the blob URL', async () => {
        cameraCapture.mockResolvedValue( new Blob( [ 'x' ] ) )
        await harness.result.onCapture()
        await harness.result.onCapture()

        harness.result.removePhoto( 0 )
        expect( harness.result.photos.value ).toHaveLength( 1 )
        expect( globalThis.URL.revokeObjectURL ).toHaveBeenCalled()
    } )

    it( 'save creates a Junk with autoName and uploads each photo', async () => {
        cameraCapture.mockResolvedValue( new Blob( [ 'x' ] ) )
        await harness.result.onCapture()
        await harness.result.onCapture()

        createMutate.mockResolvedValue( {
            data: {
                id: 'new-junk',
            },
        } )
        uploadMutate.mockResolvedValue( {} )

        await harness.result.save( false )

        expect( createMutate ).toHaveBeenCalledWith( {
            crate_id: 'crate-1',
            name:     'Junk #4',
        } )
        expect( uploadMutate ).toHaveBeenCalledTimes( 2 )
        expect( onSaved ).toHaveBeenCalled()
    } )

    it( 'save with andAdd=true bumps localOffset and keeps the dialog open', async () => {
        cameraCapture.mockResolvedValue( new Blob( [ 'x' ] ) )
        await harness.result.onCapture()

        createMutate.mockResolvedValue( {
            data: {
                id: 'new-junk',
            },
        } )
        uploadMutate.mockResolvedValue( {} )

        await harness.result.save( true )

        expect( harness.result.autoName.value ).toBe( 'Junk #5' )
        expect( harness.result.photos.value ).toEqual( [] )
        expect( onSaved ).not.toHaveBeenCalled()
    } )

    it( 'save without photos does nothing', async () => {
        await harness.result.save( false )
        expect( createMutate ).not.toHaveBeenCalled()
    } )

    it( 'save failure sets errorMessage', async () => {
        cameraCapture.mockResolvedValue( new Blob( [ 'x' ] ) )
        await harness.result.onCapture()

        createMutate.mockRejectedValue( {
            body: {
                error: {
                    message: 'oops',
                },
            },
        } )

        await harness.result.save( false )
        expect( harness.result.errorMessage.value ).toBe( 'oops' )
    } )
} )
