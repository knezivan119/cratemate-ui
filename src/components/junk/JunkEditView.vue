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
            @delete="confirmDelete( () => router.replace( '/junk' ) )"
        />
    </template>
</q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useJunkEdit } from 'src/uses/junkEditUse'
import JunkPhotosPanel from 'src/components/junk/JunkPhotosPanel.vue'
import JunkCrateWidget from 'src/components/junk/JunkCrateWidget.vue'
import JunkEditForm    from 'src/components/junk/JunkEditForm.vue'

const props = defineProps( {
    junkId: { type: Object, required: true },  // expects a Ref<string>
} )

const router = useRouter()

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
} = useJunkEdit( props.junkId )

function goBack () {
    if ( window.history.length > 1 ) router.back()
    else router.replace( '/junk' )
}
</script>
