import { ref, onBeforeUnmount } from 'vue'

const CAPTURE_TARGET_PX   = 1200
const CAPTURE_MIME        = 'image/webp'
const CAPTURE_QUALITY     = 0.8
const REQUESTED_WIDTH     = 1920
const REQUESTED_HEIGHT    = 1080

function formatBytes ( bytes ) {
    if ( bytes < 1024 )        return `${ bytes } B`
    if ( bytes < 1024 * 1024 ) return `${ Math.round( bytes / 1024 ) } KB`
    return `${ ( bytes / ( 1024 * 1024 ) ).toFixed( 2 ) } MB`
}

export function useCamera () {
    const videoEl     = ref( null )
    const streaming   = ref( false )
    const error       = ref( null )
    const devices     = ref( [] )
    const deviceId    = ref( null )
    const lastCapture = ref( null )

    const supported = typeof window !== 'undefined'
        && !!window.isSecureContext
        && !!( navigator.mediaDevices && navigator.mediaDevices.getUserMedia )

    let currentStream  = null
    let currentBlobUrl = null

    function buildConstraints () {
        const video = {
            width:  { ideal: REQUESTED_WIDTH },
            height: { ideal: REQUESTED_HEIGHT },
        }
        if ( deviceId.value ) {
            video.deviceId = { exact: deviceId.value }
        }
        return { video, audio: false }
    }

    async function enumerateDevices () {
        try {
            const all = await navigator.mediaDevices.enumerateDevices()
            devices.value = all.filter( ( d ) => d.kind === 'videoinput' )
        }
        catch {
            devices.value = []
        }
    }

    function stopCamera () {
        if ( currentStream ) {
            currentStream.getTracks().forEach( ( t ) => t.stop() )
            currentStream = null
        }
        if ( videoEl.value ) {
            videoEl.value.srcObject = null
        }
        streaming.value = false
    }

    async function startCamera () {
        error.value = null
        try {
            stopCamera()
            const stream = await navigator.mediaDevices.getUserMedia( buildConstraints() )
            currentStream = stream
            if ( videoEl.value ) {
                videoEl.value.srcObject = stream
            }
            streaming.value = true
            await enumerateDevices()
        }
        catch ( err ) {
            error.value = `${ err.name }: ${ err.message }`
            streaming.value = false
        }
    }

    async function restartIfStreaming () {
        if ( streaming.value ) {
            await startCamera()
        }
    }

    async function capture () {
        if ( !videoEl.value || !currentStream ) return null

        const video        = videoEl.value
        const sourceWidth  = video.videoWidth
        const sourceHeight = video.videoHeight
        if ( !sourceWidth || !sourceHeight ) {
            error.value = 'Video not ready yet — try again in a moment.'
            return null
        }

        const side = Math.min( sourceWidth, sourceHeight )
        const sx = ( sourceWidth  - side ) / 2
        const sy = ( sourceHeight - side ) / 2

        const canvas = document.createElement( 'canvas' )
        canvas.width  = CAPTURE_TARGET_PX
        canvas.height = CAPTURE_TARGET_PX
        const ctx = canvas.getContext( '2d' )
        ctx.drawImage( video, sx, sy, side, side, 0, 0, CAPTURE_TARGET_PX, CAPTURE_TARGET_PX )

        const blob = await new Promise( ( resolve ) => {
            canvas.toBlob( resolve, CAPTURE_MIME, CAPTURE_QUALITY )
        } )

        if ( !blob ) {
            error.value = 'Image encoding failed in this browser.'
            return null
        }

        if ( currentBlobUrl ) {
            URL.revokeObjectURL( currentBlobUrl )
        }
        currentBlobUrl = URL.createObjectURL( blob )

        lastCapture.value = {
            blob,
            url:  currentBlobUrl,
            size: formatBytes( blob.size ),
        }

        return blob
    }

    function clearCapture () {
        if ( currentBlobUrl ) {
            URL.revokeObjectURL( currentBlobUrl )
            currentBlobUrl = null
        }
        lastCapture.value = null
    }

    onBeforeUnmount( () => {
        stopCamera()
        if ( currentBlobUrl ) {
            URL.revokeObjectURL( currentBlobUrl )
            currentBlobUrl = null
        }
    } )

    return {
        videoEl,
        streaming,
        error,
        devices,
        deviceId,
        lastCapture,
        supported,
        startCamera,
        stopCamera,
        capture,
        clearCapture,
        restartIfStreaming,
    }
}
