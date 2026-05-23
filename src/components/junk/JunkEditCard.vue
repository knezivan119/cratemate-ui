<template>
<div class="junk-edit-card">
    <q-banner v-if="loadError" rounded class="bg-negative text-white q-mb-md">
        {{ loadError.message || 'Failed to load' }}
    </q-banner>

    <template v-if="junk">
        <JunkPhotosPanel :junk-id="junkId" />

        <div class="text-subtitle2 text-grey-7 q-mb-xs">In</div>
        <JunkCrateWidget v-model="form.crate_id" class="q-mb-lg" />

        <JunkEditForm
            v-model:form="form"
            :tag-options="tagOptions"
            :tags-loading="tagsLoading"
            :is-dirty="isDirty"
            :saving="saving"
            :error-message="errorMessage"
            @save="onSave"
            @delete="onDelete"
        />
    </template>
</div>
</template>

<script setup>
import { computed } from 'vue'
import { useJunkEdit } from 'src/uses/junkEditUse'
import JunkPhotosPanel from 'src/components/junk/JunkPhotosPanel.vue'
import JunkCrateWidget from 'src/components/junk/JunkCrateWidget.vue'
import JunkEditForm    from 'src/components/junk/JunkEditForm.vue'

const props = defineProps( {
    junkId: {
        type:     String,
        required: true,
    },
} )

const emit = defineEmits( [ 'deleted' ] )

// Composables expect a Ref<string>; props are values. Wrap at the boundary.
const junkIdRef = computed( () => props.junkId )

const {
    junk,
    tagOptions,
    tagsLoading,
    loadError,
    form,
    isDirty,
    saving,
    errorMessage,
    onSave,
    confirmDelete,
} = useJunkEdit( junkIdRef )

function onDelete () {
    confirmDelete( () => emit( 'deleted' ) )
}
</script>
