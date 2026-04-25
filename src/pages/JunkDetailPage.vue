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
            <q-input
                v-model="form.name"
                label="Name"
                outlined
                :rules="[ val => !!val || 'Name is required' ]"
            />

            <q-input
                v-model="form.description"
                label="Description"
                outlined
                type="textarea"
                autogrow
            />

            <div class="row q-col-gutter-md">
                <div class="col-6">
                    <q-input
                        v-model.number="form.quantity"
                        label="Quantity"
                        outlined
                        type="number"
                        min="1"
                    />
                </div>
                <div class="col-6">
                    <q-input
                        v-model="form.unit"
                        label="Unit"
                        outlined
                        placeholder="ea"
                        maxlength="16"
                    />
                </div>
            </div>

            <q-select
                v-model="form.tags"
                :options="tagOptions"
                label="Tags"
                outlined
                multiple
                emit-value
                map-options
                use-chips
                clearable
                :loading="tagsLoading"
            />

            <q-banner v-if="submitError" rounded class="bg-negative text-white">
                {{ submitError }}
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
                    @click="confirmDelete"
                />
            </div>
        </q-form>
    </template>
</q-page>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCamera } from 'src/composables/useCamera'
import {
    useJunk,
    useUpdateJunk,
    useDeleteJunk,
    useUploadJunkPhoto,
    useDeleteJunkPhoto,
} from 'src/queries/junk'
import { useCrate } from 'src/queries/crates'
import { useTagsList } from 'src/queries/tags'
import { iconForType } from 'src/utils/crateIcon'
import CratePickerDialog from 'src/components/CratePickerDialog.vue'

const route  = useRoute()
const router = useRouter()
const $q     = useQuasar()

const junkId = computed( () => route.params.id )

const { data: junkData, error: junkError } = useJunk( junkId )
const junk   = computed( () => junkData.value?.data )
const photos = computed( () => junk.value?.photos ?? [] )

const currentCrateId = computed( () => junk.value?.crate_id ?? null )
const { data: crateData, error: crateError } = useCrate( currentCrateId )
const currentCrate = computed( () => crateData.value?.data )

const { data: tagsData, isLoading: tagsLoading } = useTagsList()
const tagOptions = computed( () =>
    ( tagsData.value?.data ?? [] ).map( ( t ) => ( {
        label: t.name,
        value: t.id,
    } ) ),
)

const updateJunk      = useUpdateJunk()
const deleteJunk      = useDeleteJunk()
const uploadPhoto     = useUploadJunkPhoto()
const deletePhoto     = useDeleteJunkPhoto()

const loadError = computed( () => junkError.value || crateError.value )

// Local form state — synced from server payload, edited locally, PATCHed on save.
const form = ref( {
    name:        '',
    description: '',
    quantity:    1,
    unit:        'ea',
    tags:        [],
    crate_id:    null,
} )

watch(
    junk,
    ( j ) => {
        if ( !j ) return
        form.value = {
            name:        j.name        || '',
            description: j.description || '',
            quantity:    j.quantity    || 1,
            unit:        j.unit        || 'ea',
            tags:        ( j.tags || [] ).map( ( t ) => t.id ),
            crate_id:    j.crate_id,
        }
    },
    { immediate: true },
)

const isDirty = computed( () => {
    if ( !junk.value ) return false
    const j = junk.value
    if ( form.value.name        !== ( j.name        || '' ) ) return true
    if ( form.value.description !== ( j.description || '' ) ) return true
    if ( form.value.quantity    !== ( j.quantity    || 1 ) )  return true
    if ( form.value.unit        !== ( j.unit        || 'ea' ) ) return true
    if ( form.value.crate_id    !== j.crate_id )              return true
    const serverTagIds = ( j.tags || [] ).map( ( t ) => t.id ).sort().join( ',' )
    const localTagIds  = [ ...form.value.tags ].sort().join( ',' )
    if ( serverTagIds !== localTagIds ) return true
    return false
} )

const saving      = ref( false )
const submitError = ref( null )

async function onSave () {
    saving.value      = true
    submitError.value = null
    try {
        await updateJunk.mutateAsync( {
            id:      junkId.value,
            payload: { ...form.value },
        } )
    }
    catch ( err ) {
        submitError.value = err?.body?.error?.message || err.message || 'Save failed'
    }
    finally {
        saving.value = false
    }
}

function confirmDelete () {
    $q.dialog( {
        title:     'Delete Junk',
        message:   `Delete "${ junk.value.name }"? This cannot be undone.`,
        cancel:    true,
        persistent: true,
    } ).onOk( async () => {
        try {
            await deleteJunk.mutateAsync( junkId.value )
            router.replace( '/junk' )
        }
        catch ( err ) {
            submitError.value = err?.body?.error?.message || err.message || 'Delete failed'
        }
    } )
}

function confirmRemovePhoto ( photo ) {
    $q.dialog( {
        title:     'Remove photo',
        message:   'Remove this photo? This cannot be undone.',
        cancel:    true,
        persistent: true,
    } ).onOk( async () => {
        try {
            await deletePhoto.mutateAsync( {
                junkId:  junkId.value,
                photoId: photo.id,
            } )
        }
        catch ( err ) {
            submitError.value = err?.body?.error?.message || err.message || 'Remove failed'
        }
    } )
}

function openCratePicker () {
    $q.dialog( { component: CratePickerDialog } )
        .onOk( ( picked ) => {
            form.value.crate_id = picked.id
        } )
}

function goBack () {
    if ( window.history.length > 1 ) router.back()
    else router.replace( '/junk' )
}

// --- Add-photo panel (inline camera + file upload) ---

const addingPhoto    = ref( false )
const uploadingPhoto = ref( false )
const uploadFile     = ref( null )

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
        submitError.value = err?.body?.error?.message || err.message || 'Upload failed'
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
        submitError.value = err?.body?.error?.message || err.message || 'Upload failed'
    }
    finally {
        uploadingPhoto.value = false
    }
}

onBeforeUnmount( () => {
    stopCamera()
} )
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
