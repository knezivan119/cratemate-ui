<template>
<q-page padding>
    <div class="text-h4 q-mb-md">Image Test</div>

    <q-banner v-if="!supported" rounded class="bg-warning text-white">
        <template #avatar>
            <q-icon name="no_photography" />
        </template>
        Camera capture is not supported in this browser.
    </q-banner>

    <template v-else>
        <q-banner v-if="error" rounded class="bg-negative text-white q-mb-md">
            <template #avatar>
                <q-icon name="error" />
            </template>
            {{ error }}
        </q-banner>

        <div class="row q-gutter-md items-center q-mb-md">
            <q-btn
                v-if="!streaming"
                color="primary"
                icon="videocam"
                label="Start camera"
                @click="startCamera"
            />
            <q-btn
                v-else
                color="grey-7"
                icon="videocam_off"
                label="Stop"
                @click="stopCamera"
            />
            <q-btn
                color="primary"
                icon="camera"
                label="Capture"
                :disable="!streaming"
                @click="capture"
            />
            <q-select
                v-if="devices.length > 1"
                v-model="deviceId"
                :options="deviceOptions"
                label="Camera"
                emit-value
                map-options
                outlined
                dense
                style="min-width: 240px"
                @update:model-value="restartIfStreaming"
            />
        </div>

        <div class="row q-gutter-md items-start">
            <div class="col-auto">
                <div class="text-subtitle2 q-mb-xs">Live preview</div>
                <video
                    ref="videoEl"
                    autoplay
                    playsinline
                    muted
                    class="preview"
                />
            </div>

            <div v-if="lastCapture" class="col-auto">
                <div class="text-subtitle2 q-mb-xs">
                    Last capture — {{ lastCapture.size }}
                </div>
                <img
                    :src="lastCapture.url"
                    alt="Last captured frame"
                    class="capture"
                />
            </div>
        </div>
    </template>
</q-page>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const supported = typeof window !== 'undefined'
    && !!window.isSecureContext
    && !!( navigator.mediaDevices && navigator.mediaDevices.getUserMedia )

const videoEl     = ref( null )
const streaming   = ref( false )
const error       = ref( null )
const devices     = ref( [] )
const deviceId    = ref( null )
const lastCapture = ref( null )

let currentStream  = null
let currentBlobUrl = null

const deviceOptions = computed( () =>
    devices.value.map( ( d, i ) => ( {
        label: d.label || `Camera ${ i + 1 }`,
        value: d.deviceId,
    } ) ),
)

function formatBytes ( bytes ) {
    if ( bytes < 1024 )         return `${ bytes } B`
    if ( bytes < 1024 * 1024 )  return `${ Math.round( bytes / 1024 ) } KB`
    return `${ ( bytes / ( 1024 * 1024 ) ).toFixed( 2 ) } MB`
}

function buildConstraints () {
    const video = {
        width:  { ideal: 1920 },
        height: { ideal: 1080 },
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
    if ( !videoEl.value || !currentStream ) return

    const video        = videoEl.value
    const sourceWidth  = video.videoWidth
    const sourceHeight = video.videoHeight
    if ( !sourceWidth || !sourceHeight ) {
        error.value = 'Video not ready yet — try again in a moment.'
        return
    }

    const side = Math.min( sourceWidth, sourceHeight )
    const sx = ( sourceWidth  - side ) / 2
    const sy = ( sourceHeight - side ) / 2
    const target = 1200

    const canvas = document.createElement( 'canvas' )
    canvas.width  = target
    canvas.height = target
    const ctx = canvas.getContext( '2d' )
    ctx.drawImage( video, sx, sy, side, side, 0, 0, target, target )

    const blob = await new Promise( ( resolve ) => {
        canvas.toBlob( resolve, 'image/webp', 0.8 )
    } )

    if ( !blob ) {
        error.value = 'WebP encoding failed in this browser.'
        return
    }

    if ( currentBlobUrl ) {
        URL.revokeObjectURL( currentBlobUrl )
    }
    currentBlobUrl = URL.createObjectURL( blob )

    lastCapture.value = {
        url:  currentBlobUrl,
        size: formatBytes( blob.size ),
    }
}

onBeforeUnmount( () => {
    stopCamera()
    if ( currentBlobUrl ) {
        URL.revokeObjectURL( currentBlobUrl )
        currentBlobUrl = null
    }
} )
</script>

<style scoped>
.preview {
    width: 100%;
    max-width: 480px;
    background: #000;
    border-radius: 8px;
    aspect-ratio: 4 / 3;
    object-fit: contain;
    display: block;
}
.capture {
    width: 100%;
    max-width: 400px;
    max-height: 400px;
    border-radius: 8px;
    display: block;
}
</style>
