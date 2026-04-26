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

            <SelectInput
                v-if="streaming && deviceOptions.length > 1"
                v-model="deviceId"
                :options="deviceOptions"
                label="Camera"
                dense
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

            <q-banner v-if="errorMessage" rounded class="bg-negative text-white q-mt-md">
                {{ errorMessage }}
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
                    @click="save( false )"
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
                    @click="save( true )"
                />
            </div>
        </q-card-actions>
    </q-card>
</q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useJunkCapture } from 'src/uses/junkCaptureUse'
import SelectInput from 'src/components/input/SelectInput.vue'

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

const {
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
} = useJunkCapture( {
    crateId: computed( () => props.crateId ),
    onSaved: () => onDialogOK(),
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
