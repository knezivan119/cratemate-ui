<template>
<div class="junk-photos-panel">
    <div class="text-subtitle2 text-grey-7 q-mb-xs">Photos</div>
    <div class="photos-grid q-mb-md">
        <div
            v-for="photo in photos"
            :key="photo.id"
            class="photo-cell"
        >
            <button
                type="button"
                class="photo-button"
                aria-label="View photo"
                @click="openPhoto( photo )"
            >
                <img
                    :src="photo.thumb_url || photo.url"
                    class="photo-thumb"
                    :alt="photo.file_name"
                />
            </button>
            <q-btn
                round
                dense
                size="sm"
                color="negative"
                icon="close"
                class="photo-remove"
                aria-label="Remove photo"
                @click="confirmRemovePhoto( photo )"
            />
        </div>

        <button
            v-if="!addingPhoto"
            type="button"
            class="photo-cell photo-add"
            @click="openAddPhoto"
        >
            <q-icon name="add_a_photo" size="2rem" />
            <div class="text-caption q-mt-xs">Add photo</div>
        </button>
    </div>

    <q-card
        v-if="addingPhoto"
        flat
        bordered
        class="q-mb-lg"
    >
        <q-card-section class="row items-center q-pb-none">
            <div class="text-subtitle1">Add a photo</div>
            <q-space />
            <q-btn
                flat
                dense
                round
                icon="close"
                aria-label="Cancel"
                @click="closeAddPhoto"
            />
        </q-card-section>

        <q-card-section>
            <q-banner
                v-if="!cameraSupported"
                rounded
                class="bg-warning text-white q-mb-md"
            >
                Camera capture not supported here — use Upload instead.
            </q-banner>

            <q-banner
                v-else-if="cameraError"
                rounded
                class="bg-negative text-white q-mb-md"
            >
                {{ cameraError }}
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
                <div v-if="!streaming" class="camera-placeholder column flex-center text-grey-5">
                    <q-icon name="videocam_off" size="3rem" />
                    <div class="q-mt-sm text-caption">Camera off</div>
                </div>
            </div>

            <div class="row q-gutter-sm q-mb-sm">
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
                        label="Capture & upload"
                        class="col"
                        :loading="uploadingPhoto"
                        @click="captureAndUpload"
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

            <q-separator class="q-my-sm" />
            <div class="text-caption text-grey-7 q-mb-xs">Or upload from disk</div>
            <q-file
                v-model="uploadFile"
                label="Pick an image"
                outlined
                accept="image/*"
                :loading="uploadingPhoto"
                @update:model-value="onFileSelected"
            />
        </q-card-section>
    </q-card>

    <q-banner v-if="errorMessage" rounded class="bg-negative text-white q-mb-md">
        {{ errorMessage }}
    </q-banner>
</div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useJunkPhotoEdit } from 'src/uses/junkPhotoEditUse'
import SelectInput from 'src/components/input/SelectInput.vue'
import JunkPhotoLightbox from 'src/components/junk/JunkPhotoLightbox.vue'

const $q = useQuasar()

const props = defineProps( {
    junkId: { type: Object, required: true },  // expects a Ref<string>
} )

function openPhoto ( photo ) {
    $q.dialog( {
        component: JunkPhotoLightbox,
        componentProps: {
            photo,
        },
    } )
}

const {
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
} = useJunkPhotoEdit( props.junkId )
</script>

<style scoped>
.photos-grid {
    display: grid;
    /* xs (smallest): 3 per row. From sm up: 12 per row. Strip-style strip on
       desktop, comfortably tappable thumbs on mobile. */
    grid-template-columns: repeat( 3, 1fr );
    gap: 0.5rem;
}
@media ( min-width: 37.5rem ) {
    .photos-grid {
        grid-template-columns: repeat( 12, 1fr );
    }
}
.photo-cell {
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: 0.375rem;
    overflow: hidden;
    background: #f4f4f4;
}
.photo-button {
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    display: block;
}
.photo-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
.photo-remove {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
}
.photo-add {
    border: 0.125rem dashed #ccc;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #666;
    cursor: pointer;
}
.photo-add:hover {
    border-color: var( --q-primary );
    color: var( --q-primary );
}
.camera-frame {
    width: 100%;
    max-width: 30rem;
    aspect-ratio: 1 / 1;
    background: #000;
    border-radius: 0.5rem;
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
</style>
