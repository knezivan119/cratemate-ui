<template>
<q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="min-width: 520px; max-width: 95vw">
        <q-card-section>
            <div class="text-h6">{{ isEdit ? 'Edit Junk' : 'New Junk' }}</div>
        </q-card-section>

        <q-card-section>
            <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <q-input
                    v-model="form.name"
                    label="Name *"
                    outlined
                    autofocus
                    :rules="[ ( val ) => !!val || 'Name is required' ]"
                />

                <q-select
                    v-model="form.crate_id"
                    label="Crate *"
                    outlined
                    :options="crateOptions"
                    option-value="id"
                    option-label="name"
                    emit-value
                    map-options
                    :loading="crateStore.loading"
                    :rules="[ ( val ) => !!val || 'Crate is required' ]"
                />

                <q-input
                    v-model="form.description"
                    label="Description"
                    outlined
                    type="textarea"
                    autogrow
                />

                <div v-if="!isEdit && cameraSupported">
                    <div class="text-subtitle2 q-mb-xs">Photo (optional)</div>

                    <q-banner v-if="cameraError" rounded class="bg-negative text-white q-mb-sm">
                        {{ cameraError }}
                    </q-banner>

                    <div class="row q-gutter-md items-start">
                        <div class="col-auto">
                            <video
                                ref="videoEl"
                                autoplay
                                playsinline
                                muted
                                class="preview"
                            />
                            <div class="row q-gutter-sm q-mt-sm">
                                <q-btn
                                    v-if="!streaming"
                                    icon="videocam"
                                    label="Start camera"
                                    dense
                                    @click="startCamera"
                                />
                                <q-btn
                                    v-else
                                    icon="videocam_off"
                                    label="Stop"
                                    color="grey-7"
                                    dense
                                    @click="stopCamera"
                                />
                                <q-btn
                                    color="primary"
                                    icon="camera"
                                    label="Capture"
                                    dense
                                    :disable="!streaming"
                                    @click="capture"
                                />
                            </div>
                        </div>

                        <div v-if="lastCapture" class="col-auto">
                            <div class="text-caption text-grey-7">
                                Captured — {{ lastCapture.size }}
                            </div>
                            <img
                                :src="lastCapture.url"
                                alt="Captured photo"
                                class="captured-thumb"
                            />
                            <q-btn
                                flat
                                dense
                                size="sm"
                                icon="close"
                                label="Remove"
                                @click="clearCapture"
                            />
                        </div>
                    </div>
                </div>

                <q-banner v-if="submitError" rounded class="bg-negative text-white">
                    {{ submitError }}
                </q-banner>

                <q-card-actions align="right">
                    <q-btn flat label="Cancel" @click="onDialogCancel" />
                    <q-btn
                        color="primary"
                        :label="isEdit ? 'Save' : 'Create'"
                        type="submit"
                        :loading="saving"
                    />
                </q-card-actions>
            </q-form>
        </q-card-section>
    </q-card>
</q-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useCamera } from 'src/composables/useCamera'
import { useCrateStore } from 'src/stores/crate-store'
import { useCreateJunk, useUpdateJunk, useUploadJunkPhoto } from 'src/queries/junk'

const props = defineProps( {
    junk: {
        type: Object,
        default: null,
    },
} )

defineEmits( [ ...useDialogPluginComponent.emits ] )

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const crateStore = useCrateStore()

const {
    videoEl,
    streaming,
    error: cameraError,
    lastCapture,
    supported: cameraSupported,
    startCamera,
    stopCamera,
    capture,
    clearCapture,
} = useCamera()

const createJunk  = useCreateJunk()
const updateJunk  = useUpdateJunk()
const uploadPhoto = useUploadJunkPhoto()

const isEdit = computed( () => !!props.junk )

const crateOptions = computed( () => crateStore.crates )

const form = reactive( {
    name:        props.junk?.name        || '',
    description: props.junk?.description || '',
    crate_id:    props.junk?.crate_id    || null,
} )

const saving      = ref( false )
const submitError = ref( null )

async function onSubmit () {
    saving.value      = true
    submitError.value = null
    try {
        if ( isEdit.value ) {
            await updateJunk.mutateAsync( {
                id: props.junk.id,
                payload: form,
            } )
        }
        else {
            const created = await createJunk.mutateAsync( form )
            const blob = lastCapture.value?.blob
            if ( blob ) {
                await uploadPhoto.mutateAsync( {
                    junkId: created.data.id,
                    blob,
                } )
            }
        }
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
    if ( !crateStore.crates.length ) {
        crateStore.fetchCrates()
    }
} )
</script>

<style scoped>
.preview {
    width: 320px;
    max-width: 100%;
    background: #000;
    border-radius: 6px;
    aspect-ratio: 4 / 3;
    object-fit: contain;
    display: block;
}
.captured-thumb {
    display: block;
    width: 140px;
    height: 140px;
    object-fit: cover;
    border-radius: 6px;
}
</style>
