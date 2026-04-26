import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'

const junkData     = ref( null )
const uploadMutate = vi.fn()
const deleteMutate = vi.fn()

const cameraCapture       = vi.fn()
const cameraStartCamera   = vi.fn()
const cameraStopCamera    = vi.fn()
const cameraClearCapture  = vi.fn()
const cameraRestart       = vi.fn()

let dialogOnOkCallback = null
const $qDialog = vi.fn( () => ( {
    onOk: ( fn ) => {
        dialogOnOkCallback = fn
        return { onOk: vi.fn() }
    },
} ) )

vi.mock( 'src/queries/junkQuery', () => ( {
    useJunk:             () => ( { data: junkData } ),
    useUploadJunkPhoto:  () => ( { mutateAsync: uploadMutate } ),
    useDeleteJunkPhoto:  () => ( { mutateAsync: deleteMutate } ),
} ) )

vi.mock( 'src/uses/cameraUse', () => ( {
    useCamera: () => ( {
        videoEl:   ref( null ),
        streaming: ref( false ),
        error:     ref( null ),
        devices:   ref( [] ),
        deviceId:  ref( null ),
        supported: true,
        startCamera:        cameraStartCamera,
        stopCamera:         cameraStopCamera,
        capture:            cameraCapture,
        clearCapture:       cameraClearCapture,
        restartIfStreaming: cameraRestart,
    } ),
} ) )

vi.mock( 'quasar', () => ( {
    useQuasar: () => ( { dialog: $qDialog } ),
} ) )

import { useJunkPhotoEdit } from 'src/uses/junkPhotoEditUse'
import { withSetup } from '../helpers/withSetupHelper'

describe( 'junkPhotoEditUse', () => {
    let harness, junkIdRef

    beforeEach( () => {
        junkData.value = null
        uploadMutate.mockReset()
        deleteMutate.mockReset()
        cameraCapture.mockReset()
        cameraStopCamera.mockReset()
        cameraClearCapture.mockReset()
        $qDialog.mockClear()
        dialogOnOkCallback = null

        junkIdRef = ref( 'junk-1' )
        harness = withSetup( () => useJunkPhotoEdit( junkIdRef ) )
    } )

    afterEach( () => {
        harness.unmount()
    } )

    it( 'photos derives from the junk query', async () => {
        junkData.value = { data: { photos: [ { id: 'p1' }, { id: 'p2' } ] } }
        await nextTick()
        expect( harness.result.photos.value ).toHaveLength( 2 )
    } )

    it( 'photos is empty when junk has none', () => {
        expect( harness.result.photos.value ).toEqual( [] )
    } )

    it( 'openAddPhoto / closeAddPhoto toggles addingPhoto and stops the camera', () => {
        const { addingPhoto, openAddPhoto, closeAddPhoto } = harness.result
        openAddPhoto()
        expect( addingPhoto.value ).toBe( true )
        closeAddPhoto()
        expect( addingPhoto.value ).toBe( false )
        expect( cameraStopCamera ).toHaveBeenCalled()
    } )

    it( 'captureAndUpload uploads the captured blob and clears capture', async () => {
        cameraCapture.mockResolvedValue( new Blob( [ 'x' ] ) )
        uploadMutate.mockResolvedValue( {} )

        await harness.result.captureAndUpload()

        expect( uploadMutate ).toHaveBeenCalledWith( expect.objectContaining( {
            junkId:   'junk-1',
            fileName: 'capture.webp',
        } ) )
        expect( cameraClearCapture ).toHaveBeenCalled()
    } )

    it( 'captureAndUpload skips upload if capture returns null', async () => {
        cameraCapture.mockResolvedValue( null )
        await harness.result.captureAndUpload()
        expect( uploadMutate ).not.toHaveBeenCalled()
    } )

    it( 'onFileSelected uploads a disk-picked file using its name', async () => {
        uploadMutate.mockResolvedValue( {} )
        const file = new File( [ 'x' ], 'cat.jpg' )

        await harness.result.onFileSelected( file )

        expect( uploadMutate ).toHaveBeenCalledWith( expect.objectContaining( {
            junkId:   'junk-1',
            blob:     file,
            fileName: 'cat.jpg',
        } ) )
    } )

    it( 'onFileSelected with no file is a no-op', async () => {
        await harness.result.onFileSelected( null )
        expect( uploadMutate ).not.toHaveBeenCalled()
    } )

    it( 'confirmRemovePhoto opens a confirmation dialog; on OK deletes the photo', async () => {
        deleteMutate.mockResolvedValue( {} )

        harness.result.confirmRemovePhoto( { id: 'p1' } )
        expect( $qDialog ).toHaveBeenCalled()
        expect( typeof dialogOnOkCallback ).toBe( 'function' )

        await dialogOnOkCallback()
        expect( deleteMutate ).toHaveBeenCalledWith( {
            junkId:  'junk-1',
            photoId: 'p1',
        } )
    } )

    it( 'upload failure sets errorMessage', async () => {
        cameraCapture.mockResolvedValue( new Blob( [ 'x' ] ) )
        uploadMutate.mockRejectedValue( { body: { error: { message: 'nope' } } } )

        await harness.result.captureAndUpload()
        expect( harness.result.errorMessage.value ).toBe( 'nope' )
    } )
} )
