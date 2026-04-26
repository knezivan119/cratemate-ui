<template>
<q-page padding class="q-pb-xl">
    <div class="row items-center q-mb-md">
        <q-btn
            flat
            dense
            round
            icon="arrow_back"
            class="q-mr-sm"
            aria-label="Back"
            @click="goBack"
        />
        <div class="text-h5 ellipsis">
            {{ junk?.name || 'Loading…' }}
        </div>
    </div>

    <q-banner v-if="loadError" rounded class="bg-negative text-white q-mb-md">
        {{ loadError.message || 'Failed to load' }}
    </q-banner>

    <template v-if="junk">
        <!-- Photos -->
        <div class="text-subtitle2 text-grey-7 q-mb-xs">Photos</div>
        <div class="photos-grid q-mb-md">
            <div
                v-for="photo in photos"
                :key="photo.id"
                class="photo-cell"
            >
                <a :href="photo.url" target="_blank" rel="noopener">
                    <img
                        :src="photo.thumb_url || photo.url"
                        class="photo-thumb"
                        :alt="photo.file_name"
                    />
                </a>
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
                <q-icon name="add_a_photo" size="32px" />
                <div class="text-caption q-mt-xs">Add photo</div>
            </button>
        </div>

        <!-- Inline add-photo panel -->
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
                        <q-icon name="videocam_off" size="48px" />
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

        <!-- Crate -->
        <div class="text-subtitle2 text-grey-7 q-mb-xs">In</div>
        <q-card flat bordered class="q-mb-lg">
            <q-card-section class="row items-center q-py-sm">
                <q-avatar
                    :color="iconForType( currentCrate?.type ).color"
                    text-color="white"
                    size="36px"
                    class="q-mr-md"
                >
                    <q-icon :name="iconForType( currentCrate?.type ).icon" />
                </q-avatar>
                <div class="col">
                    <div>{{ currentCrate?.name || '…' }}</div>
                    <div v-if="currentCrate?.type" class="text-caption text-grey-7">
                        {{ currentCrate.type }}
                    </div>
                </div>
                <q-btn
                    flat
                    color="primary"
                    icon="folder_open"
                    label="Change"
                    @click="openCratePicker"
                />
            </q-card-section>
        </q-card>

        <!-- Fields -->
        <q-form @submit.prevent="onSave" class="q-gutter-md">
            <TextInput
                v-model="form.name"
                label="Name"
                :rules="[ val => !!val || 'Name is required' ]"
            />

            <TextareaInput
                v-model="form.description"
                label="Description"
            />

            <div class="row q-col-gutter-md">
                <div class="col-6">
                    <NumberInput
                        v-model="form.quantity"
                        label="Quantity"
                        min="1"
                    />
                </div>
                <div class="col-6">
                    <TextInput
                        v-model="form.unit"
                        label="Unit"
                        placeholder="ea"
                        maxlength="16"
                    />
                </div>
            </div>

            <SelectInput
                v-model="form.tags"
                :options="tagOptions"
                label="Tags"
                multiple
                use-chips
                clearable
                :loading="tagsLoading"
            />

            <q-banner v-if="bannerError" rounded class="bg-negative text-white">
                {{ bannerError }}
            </q-banner>

            <div class="row q-gutter-sm">
                <q-btn
                    color="primary"
                    icon="check"
                    label="Save"
                    type="submit"
                    :loading="saving"
                    :disable="!isDirty"
                />
                <q-btn
                    flat
                    color="negative"
                    icon="delete"
                    label="Delete"
                    @click="confirmDelete( () => router.replace( '/junk' ) )"
                />
            </div>
        </q-form>
    </template>
</q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJunkEdit }      from 'src/uses/junkEditUse'
import { useJunkPhotoEdit } from 'src/uses/junkPhotoEditUse'
import { iconForType }      from 'src/data/crateTypeData'
import TextInput     from 'src/components/input/TextInput.vue'
import NumberInput   from 'src/components/input/NumberInput.vue'
import TextareaInput from 'src/components/input/TextareaInput.vue'
import SelectInput   from 'src/components/input/SelectInput.vue'

const route  = useRoute()
const router = useRouter()
const junkId = computed( () => route.params.id )

const {
    junk,
    currentCrate,
    tagOptions,
    tagsLoading,
    loadError,
    form,
    isDirty,
    saving,
    errorMessage: editError,
    onSave,
    confirmDelete,
    openCratePicker,
} = useJunkEdit( junkId )

const {
    photos,
    addingPhoto,
    uploadingPhoto,
    uploadFile,
    errorMessage: photoError,
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
} = useJunkPhotoEdit( junkId )

const bannerError = computed( () => editError.value || photoError.value )

function goBack () {
    if ( window.history.length > 1 ) router.back()
    else router.replace( '/junk' )
}
</script>

<style scoped>
.photos-grid {
    display: grid;
    grid-template-columns: repeat( auto-fill, minmax( 96px, 1fr ) );
    gap: 8px;
}
.photo-cell {
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: 6px;
    overflow: hidden;
    background: #f4f4f4;
}
.photo-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
.photo-remove {
    position: absolute;
    top: 4px;
    right: 4px;
}
.photo-add {
    border: 2px dashed #ccc;
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
    max-width: 480px;
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
</style>
