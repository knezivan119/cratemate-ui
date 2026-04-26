import { ref, computed, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useCamera } from 'src/uses/cameraUse'
import {
    useJunk,
    useUploadJunkPhoto,
    useDeleteJunkPhoto,
} from 'src/queries/junkQuery'

export function useJunkPhotoEdit ( junkId ) {
    const $q = useQuasar()

    const { data: junkData } = useJunk( junkId )
    const photos = computed( () => junkData.value?.data?.photos ?? [] )

    const uploadPhoto = useUploadJunkPhoto()
    const deletePhoto = useDeleteJunkPhoto()

    const addingPhoto    = ref( false )
    const uploadingPhoto = ref( false )
    const uploadFile     = ref( null )
    const errorMessage   = ref( null )

    const {
        videoEl,
        streaming,
        error: cameraError,
        devices,
        deviceId,
        supported: cameraSupported,
        startCamera,
        stopCamera,
        capture,
        clearCapture,
        restartIfStreaming,
    } = useCamera()

    const deviceOptions = computed( () =>
        devices.value.map( ( d, i ) => ( {
            label: d.label || `Camera ${ i + 1 }`,
            value: d.deviceId,
        } ) ),
    )

    function openAddPhoto () {
        addingPhoto.value = true
    }

    function closeAddPhoto () {
        addingPhoto.value = false
        stopCamera()
        uploadFile.value = null
    }

    async function captureAndUpload () {
        const blob = await capture()
        if ( !blob ) return
        uploadingPhoto.value = true
        try {
            await uploadPhoto.mutateAsync( {
                junkId:   junkId.value,
                blob,
                fileName: 'capture.webp',
            } )
            clearCapture()
        }
        catch ( err ) {
            errorMessage.value = err?.body?.error?.message || err.message || 'Upload failed'
        }
        finally {
            uploadingPhoto.value = false
        }
    }

    async function onFileSelected ( file ) {
        if ( !file ) return
        uploadingPhoto.value = true
        try {
            await uploadPhoto.mutateAsync( {
                junkId:   junkId.value,
                blob:     file,
                fileName: file.name,
            } )
            uploadFile.value = null
        }
        catch ( err ) {
            errorMessage.value = err?.body?.error?.message || err.message || 'Upload failed'
        }
        finally {
            uploadingPhoto.value = false
        }
    }

    function confirmRemovePhoto ( photo ) {
        $q.dialog( {
            title:      'Remove photo',
            message:    'Remove this photo? This cannot be undone.',
            cancel:     true,
            persistent: true,
        } ).onOk( async () => {
            try {
                await deletePhoto.mutateAsync( {
                    junkId:  junkId.value,
                    photoId: photo.id,
                } )
            }
            catch ( err ) {
                errorMessage.value = err?.body?.error?.message || err.message || 'Remove failed'
            }
        } )
    }

    onBeforeUnmount( () => {
        stopCamera()
    } )

    return {
        photos,
        addingPhoto,
        uploadingPhoto,
        uploadFile,
        errorMessage,
        cameraSupported,
        cameraError,
        streaming,
        videoEl,
        deviceOptions,
        deviceId,
        openAddPhoto,
        closeAddPhoto,
        captureAndUpload,
        onFileSelected,
        confirmRemovePhoto,
        startCamera,
        stopCamera,
        restartIfStreaming,
    }
}
