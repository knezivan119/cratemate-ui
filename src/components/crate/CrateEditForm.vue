<template>
<q-form @submit.prevent="onSubmit" class="crate-edit-form q-gutter-md">
    <TextInput
        v-model="form.name"
        label="Name"
        placeholder="Optional — auto-named Crate #N if blank"
        autofocus
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

    <div class="row q-gutter-sm justify-end">
        <q-btn flat label="Cancel" @click="emit( 'cancel' )" />
        <q-btn
            color="primary"
            :label="isEdit ? 'Save' : 'Create'"
            type="submit"
            :loading="saving"
        />
    </div>
</q-form>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useCrateForm } from 'src/uses/crateFormUse'
import { crateTypeOptions } from 'src/data/crateTypeData'
import TextInput     from 'src/components/input/TextInput.vue'
import TextareaInput from 'src/components/input/TextareaInput.vue'
import SelectInput   from 'src/components/input/SelectInput.vue'

const props = defineProps( {
    crate: {
        type:    Object,
        default: null,
    },
    parentId: {
        type:    String,
        default: null,
    },
} )

const emit = defineEmits( [ 'saved', 'cancel' ] )

const isEdit = computed( () => !!props.crate )

const {
    form,
    saving,
    errorMessage,
    submit,
} = useCrateForm( {
    crate:    toRef( props, 'crate' ),
    parentId: toRef( props, 'parentId' ),
    onSaved:  ( saved ) => emit( 'saved', saved ),
} )

function onSubmit () {
    submit()
}
</script>
