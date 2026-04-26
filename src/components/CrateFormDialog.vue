<template>
<q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="min-width: 320px; max-width: 95vw; width: 480px">
        <q-card-section>
            <div class="text-h6">{{ isEdit ? 'Edit Crate' : 'New Crate' }}</div>
        </q-card-section>

        <q-card-section>
            <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <TextInput
                    v-model="form.name"
                    label="Name *"
                    autofocus
                    :rules="[ val => !!val || 'Name is required' ]"
                />

                <SelectInput
                    v-model="form.type"
                    label="Type"
                    clearable
                    :options="crateTypeOptions"
                />

                <TextareaInput
                    v-model="form.description"
                    label="Description"
                />

                <q-banner v-if="errorMessage" rounded class="bg-negative text-white">
                    {{ errorMessage }}
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
import { computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useCrateForm } from 'src/uses/crateFormUse'
import { crateTypeOptions } from 'src/data/crateTypeData'
import TextInput     from 'src/components/input/TextInput.vue'
import TextareaInput from 'src/components/input/TextareaInput.vue'
import SelectInput   from 'src/components/input/SelectInput.vue'

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

const isEdit = computed( () => !!props.crate )

const {
    form,
    saving,
    errorMessage,
    submit,
} = useCrateForm( {
    crate:    computed( () => props.crate ),
    parentId: computed( () => props.parentId ),
    onSaved:  ( saved ) => onDialogOK( saved ),
} )

function onSubmit () {
    submit()
}
</script>
