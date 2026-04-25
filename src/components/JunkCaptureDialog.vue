<template>
<q-dialog
    ref="dialogRef"
    persistent
    :maximized="isMobile"
    @hide="onDialogHide"
>
    <q-card class="column no-wrap" :class="{ 'desktop-card': !isMobile }">
        <q-toolbar class="bg-primary text-white">
            <q-toolbar-title class="text-subtitle1">
                Add Junk to {{ crateName || '…' }}
            </q-toolbar-title>
            <q-btn
                flat
                round
                icon="close"
                aria-label="Close"
                @click="onDialogCancel"
            />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md">
            <div class="text-body2 text-grey-7 q-mb-xs">Will be saved as</div>
            <div class="text-h6 q-mb-md">{{ autoName }}</div>

            <q-banner
                v-if="!cameraSupported"
                rounded
                class="bg-warning text-white q-mb-md"
            >
                Camera capture is not supported in this browser.
            </q-banner>

            <q-banner
                v-else-if="cameraError"
                rounded
                class="bg-negative text-white q-mb-md"
            >
                <div>{{ cameraError }}</div>
                <div v-if="isInUseError" class="text-caption q-mt-xs">
                    Close other apps using the camera (Zoom, browser tabs, OBS) and try again.
                </div>
                <template #action>
                    <q-btn flat label="Try again" @click="startCamera" />
                </template>
            </q-banner>

            <div class="camera-frame q-mb-sm">
                <video
                    v-show="streaming"
                    ref="videoEl"
                    autoplay
                    playsinline
                    muted
                    class="camera-preview"
                />
                <div
                    v-if="!streaming"
                    class="camera-placeholder column flex-center text-grey-5"
                >
                    <q-icon name="videocam_off" size="48px" />
                    <div class="q-mt-sm text-caption">
                        {{ cameraSupported ? 'Camera off' : 'Camera unavailable' }}
                    </div>
                </div>
            </div>

            <div class="row q-gutter-sm q-mb-md items-center">
                <q-btn
                    v-if="!streaming"
                    color="primary"
                    icon="videocam"
                    label="Start camera"
                    class="col"
                    :disable="!cameraSupported"
                    @click="startCamera"
                />
                <template v-else>
                    <q-btn
                        color="primary"
                        icon="camera"
                        label="Capture"
                        class="col"
                        size="lg"
                        :disable="atPhotoLimit"
                        @click="onCapture"
                    />
                    <q-btn
                        flat
                        color="grey-8"
                        icon="videocam_off"
                        label="Stop"
                        @click="stopCamera"
                    />
                </template>
            </div>

            <q-select
                v-if="streaming && deviceOptions.length > 1"
                v-model="deviceId"
                :options="deviceOptions"
                label="Camera"
                outlined
                dense
                emit-value
                map-options
                class="q-mb-md"
                @update:model-value="restartIfStreaming"
            />

            <div v-if="atPhotoLimit" class="text-caption text-warning q-mb-md">
                Max {{ MAX_PHOTOS }} photos per Junk.
            </div>

            <div v-if="photos.length" class="text-subtitle2 q-mb-xs">
                Captured ({{ photos.length }}/{{ MAX_PHOTOS }})
            </div>
            <div class="row q-col-gutter-xs">
                <div
                    v-for="( photo, idx ) in photos"
                    :key="photo.url"
                    class="col-4 col-sm-3 relative-position"
                >
                    <img :src="photo.url" class="thumb" :alt="`Photo ${ idx + 1 }`" />
                    <q-btn
                        round
                        dense
                        size="sm"
                        color="negative"
                        icon="close"
                        class="thumb-remove"
                        @click="removePhoto( idx )"
                        aria-label="Remove photo"
                    />
                </div>
            </div>

            <q-banner v-if="submitError" rounded class="bg-negative text-white q-mt-md">
                {{ submitError }}
            </q-banner>
        </q-card-section>

        <q-card-actions class="q-pa-md bg-grey-2 row q-col-gutter-sm">
            <div class="col">
                <q-btn
                    color="primary"
                    icon="check"
                    label="Save"
                    class="full-width"
                    size="lg"
                    :loading="saving"
                    :disable="!canSave"
                    @click="onSave( false )"
                />
            </div>
            <div class="col">
                <q-btn
                    color="secondary"
                    icon="add"
                    label="Save & add"
                    class="full-width"
                    size="lg"
                    :loading="saving"
                    :disable="!canSave"
                    @click="onSave( true )"
                />
            </div>
        </q-card-actions>
    </q-card>
</q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { useCamera } from 'src/composables/useCamera'
import { useCreateJunk, useUploadJunkPhoto, useJunkInCrate } from 'src/queries/junk'

const MAX_PHOTOS = 5

const props = defineProps( {
    crateId: {
        type: String,
        required: true,
    },
    crateName: {
        type: String,
        default: '',
    },
} )

defineEmits( [ ...useDialogPluginComponent.emits ] )

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

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

const { data: crateJunkData, refetch: refetchCount } = useJunkInCrate( computed( () => props.crateId ) )

// `nextNumber` advances locally as items are saved within this dialog session, so the user sees
// "Junk #4 → #5 → #6" without waiting on a server round-trip between saves.
const localOffset = ref( 0 )
const baseCount   = computed( () => crateJunkData.value?.meta?.total ?? 0 )
const nextNumber  = computed( () => baseCount.value + localOffset.value + 1 )
const autoName    = computed( () => `Junk #${ nextNumber.value }` )

const photos      = ref( [] )
const saving      = ref( false )
const submitError = ref( null )

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

async function onSave ( andAdd ) {
    if ( !canSave.value ) return
    saving.value      = true
    submitError.value = null
    const capturedPhotos = photos.value.slice()

    try {
        const res = await createJunk.mutateAsync( {
            crate_id: props.crateId,
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

        if ( andAdd ) {
            return
        }

        await refetchCount()
        onDialogOK()
    }
    catch ( err ) {
        submitError.value = err?.body?.error?.message || err.message || 'Save failed'
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
</script>

<style scoped>
.desktop-card {
    width: 640px;
    max-width: 95vw;
    max-height: 90vh;
}
.camera-frame {
    width: 100%;
    aspect-ratio: 1 / 1;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
}
.camera-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
.camera-placeholder {
    width: 100%;
    height: 100%;
}
.thumb {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: 6px;
    display: block;
}
.thumb-remove {
    position: absolute;
    top: 4px;
    right: 4px;
}
</style>
