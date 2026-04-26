import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useCamera } from 'src/uses/cameraUse'
import { useCreateJunk, useUploadJunkPhoto, useJunkInCrate } from 'src/queries/junkQuery'

const MAX_PHOTOS = 5

// Rapid Junk capture flow: drives a viewfinder, queues up to MAX_PHOTOS local
// captures, and persists them by creating a Junk and uploading photos sequentially.
// Caller passes `crateId` (ref|computed) for the target crate and `onSaved` to
// be notified when "Save" (not "Save & add") succeeds.
export function useJunkCapture ( { crateId, onSaved } ) {
    const $q = useQuasar()
    const isMobile = computed( () => $q.platform.is.mobile )

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

    const isInUseError = computed( () => {
        const msg = cameraError.value || ''
        return msg.includes( 'NotReadable' ) || msg.includes( 'TrackStart' ) || msg.includes( 'AbortError' )
    } )

    const createJunk  = useCreateJunk()
    const uploadPhoto = useUploadJunkPhoto()

    const { data: crateJunkData, refetch: refetchCount } = useJunkInCrate( crateId )

    // localOffset advances as items are saved within this dialog session, so
    // the user sees "Junk #4 → #5 → #6" without waiting on a server round-trip.
    const localOffset = ref( 0 )
    const baseCount   = computed( () => crateJunkData.value?.meta?.total ?? 0 )
    const nextNumber  = computed( () => baseCount.value + localOffset.value + 1 )
    const autoName    = computed( () => `Junk #${ nextNumber.value }` )

    const photos       = ref( [] )
    const saving       = ref( false )
    const errorMessage = ref( null )

    const atPhotoLimit = computed( () => photos.value.length >= MAX_PHOTOS )
    const canSave      = computed( () => photos.value.length > 0 && !saving.value )

    async function onCapture () {
        if ( atPhotoLimit.value ) return
        const blob = await capture()
        if ( !blob ) return
        const url = URL.createObjectURL( blob )
        photos.value.push( { blob, url } )
        clearCapture()
    }

    function removePhoto ( idx ) {
        const [ removed ] = photos.value.splice( idx, 1 )
        if ( removed?.url ) URL.revokeObjectURL( removed.url )
    }

    function clearPhotosLocal () {
        for ( const p of photos.value ) {
            if ( p.url ) URL.revokeObjectURL( p.url )
        }
        photos.value = []
    }

    async function save ( andAdd ) {
        if ( !canSave.value ) return
        saving.value       = true
        errorMessage.value = null
        const capturedPhotos = photos.value.slice()

        try {
            const res = await createJunk.mutateAsync( {
                crate_id: crateId.value,
                name:     autoName.value,
            } )
            const junkId = res?.data?.id
            if ( !junkId ) throw new Error( 'Junk created but no id returned' )

            for ( const photo of capturedPhotos ) {
                await uploadPhoto.mutateAsync( {
                    junkId,
                    blob:     photo.blob,
                    fileName: 'capture.webp',
                } )
            }

            localOffset.value++
            clearPhotosLocal()

            if ( andAdd ) return

            await refetchCount()
            onSaved?.()
        }
        catch ( err ) {
            errorMessage.value = err?.body?.error?.message || err.message || 'Save failed'
        }
        finally {
            saving.value = false
        }
    }

    onMounted( () => {
        if ( isMobile.value && cameraSupported ) {
            startCamera()
        }
    } )

    onBeforeUnmount( () => {
        stopCamera()
        clearPhotosLocal()
    } )

    return {
        MAX_PHOTOS,
        isMobile,
        videoEl,
        streaming,
        cameraError,
        cameraSupported,
        isInUseError,
        deviceId,
        deviceOptions,
        startCamera,
        stopCamera,
        restartIfStreaming,
        autoName,
        photos,
        saving,
        errorMessage,
        atPhotoLimit,
        canSave,
        onCapture,
        removePhoto,
        save,
    }
}
