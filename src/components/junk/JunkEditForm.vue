<template>
<q-form @submit.prevent="emit( 'save' )" class="junk-edit-form q-gutter-md">
    <TextInput
        v-model="form.name"
        label="Name"
        :rules="nameRules"
    />

    <TextareaInput
        v-model="form.description"
        label="Description"
    />

    <div class="row q-col-gutter-md">
        <NumberInput
            v-model="form.quantity"
            label="Quantity"
            min="1"
            cols="6"
        />
        <TextInput
            v-model="form.unit"
            label="Unit"
            placeholder="ea"
            maxlength="16"
            cols="6"
        />
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

    <q-banner v-if="errorMessage" rounded class="bg-negative text-white">
        {{ errorMessage }}
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
            @click="emit( 'delete' )"
        />
    </div>
</q-form>
</template>

<script setup>
import TextInput     from 'src/components/input/TextInput.vue'
import NumberInput   from 'src/components/input/NumberInput.vue'
import TextareaInput from 'src/components/input/TextareaInput.vue'
import SelectInput   from 'src/components/input/SelectInput.vue'

// `form` is the shared edit-form object owned by the page-level composable.
// Two-way bound so child Inputs can mutate fields directly via v-model.
const form = defineModel( 'form', { type: Object, required: true } )

defineProps( {
    tagOptions:   { type: Array,   default: () => [] },
    tagsLoading:  { type: Boolean, default: false },
    isDirty:      { type: Boolean, default: false },
    saving:       { type: Boolean, default: false },
    errorMessage: { type: String,  default: null },
} )

const emit = defineEmits( [ 'save', 'delete' ] )

const nameRules = [ ( val ) => !!val || 'Name is required' ]
</script>
