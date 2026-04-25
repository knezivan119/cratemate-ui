<template>
<q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="min-width: 320px; max-width: 95vw; width: 480px">
        <q-card-section>
            <div class="text-h6">{{ isEdit ? 'Edit Crate' : 'New Crate' }}</div>
        </q-card-section>

        <q-card-section>
            <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <q-input
                    v-model="form.name"
                    label="Name *"
                    outlined
                    autofocus
                    :rules="[ val => !!val || 'Name is required' ]"
                />

                <q-select
                    v-model="form.type"
                    label="Type"
                    outlined
                    clearable
                    :options="typeOptions"
                    emit-value
                    map-options
                />

                <q-input
                    v-model="form.description"
                    label="Description"
                    outlined
                    type="textarea"
                    autogrow
                />

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
import { ref, reactive, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useCreateCrate, useUpdateCrate } from 'src/queries/crates'

const props = defineProps( {
    crate: {
        type: Object,
        default: null,
    },
    parentId: {
        type: String,
        default: null,
    },
} )

defineEmits( [ ...useDialogPluginComponent.emits ] )

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const createCrate = useCreateCrate()
const updateCrate = useUpdateCrate()

const isEdit = computed( () => !!props.crate )

const typeOptions = [
    { label: 'Location', value: 'location' },
    { label: 'Room',     value: 'room' },
    { label: 'Crate',    value: 'crate' },
    { label: 'Person',   value: 'person' },
    { label: 'Vehicle',  value: 'vehicle' },
]

const form = reactive( {
    name:        props.crate?.name        || '',
    type:        props.crate?.type        || null,
    description: props.crate?.description || '',
} )

const saving      = ref( false )
const submitError = ref( null )

async function onSubmit () {
    saving.value      = true
    submitError.value = null
    try {
        if ( isEdit.value ) {
            await updateCrate.mutateAsync( {
                id:      props.crate.id,
                payload: form,
            } )
        }
        else {
            await createCrate.mutateAsync( {
                ...form,
                parent_id: props.parentId,
            } )
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
</script>
