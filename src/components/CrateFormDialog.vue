<template>
<q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="min-width: 450px">
        <q-card-section>
            <div class="text-h6">{{ isEdit ? 'Edit Crate' : 'New Crate' }}</div>
        </q-card-section>

        <q-card-section>
            <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <q-input
                    v-model="form.name"
                    label="Name *"
                    outlined
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

                <q-select
                    v-model="form.parent_id"
                    label="Parent Crate"
                    outlined
                    clearable
                    :options="parentOptions"
                    option-value="id"
                    option-label="name"
                    emit-value
                    map-options
                />

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
import { ref, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useCrateStore } from 'src/stores/crate-store'

const props = defineProps( {
    crate: {
        type: Object,
        default: null,
    },
} )

defineEmits( [ ...useDialogPluginComponent.emits ] )

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const crateStore = useCrateStore()

const isEdit = computed( () => !!props.crate )

const typeOptions = [
    { label: 'Location', value: 'location' },
    { label: 'Room', value: 'room' },
    { label: 'Crate', value: 'crate' },
    { label: 'Person', value: 'person' },
    { label: 'Vehicle', value: 'vehicle' },
]

const parentOptions = computed( () => {
    return crateStore.crates.filter( ( c ) => {
        if ( !props.crate ) return true
        return c.id !== props.crate.id
    } )
} )

const form = ref( {
    name: props.crate?.name || '',
    type: props.crate?.type || null,
    description: props.crate?.description || '',
    parent_id: props.crate?.parent_id || null,
} )

const saving = ref( false )

async function onSubmit () {
    saving.value = true
    try {
        if ( isEdit.value ) {
            await crateStore.updateCrate( props.crate.id, form.value )
        }
        else {
            await crateStore.createCrate( form.value )
        }
        onDialogOK()
    }
    catch {
        // error is set in the store
    }
    finally {
        saving.value = false
    }
}
</script>
