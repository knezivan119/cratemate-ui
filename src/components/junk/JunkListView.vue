<template>
<q-page padding class="junk-list-view q-pb-xl">
    <div class="row items-center q-mb-md">
        <div class="text-h5 col">Junk</div>
        <div v-if="totalCount > 0" class="text-caption text-grey-7">
            {{ totalLoaded }} of {{ totalCount }}
        </div>
    </div>

    <q-banner v-if="error" rounded class="bg-negative text-white q-mb-md">
        {{ error.message || 'Failed to load' }}
    </q-banner>

    <div v-if="initialLoading" class="row flex-center q-pa-lg">
        <q-spinner size="2rem" color="primary" />
    </div>

    <div v-else-if="items.length === 0" class="text-grey-7 q-pa-lg text-center">
        No junk yet. Open a crate and tap "Add Junk" to start.
    </div>

    <template v-else>
        <JunkGallery
            :items="items"
            show-edit
            show-crate
            class="q-mb-md"
            @select="openPreview"
            @edit="openEdit"
        />

        <div v-if="hasMore" class="row flex-center q-mt-md">
            <q-btn
                outline
                color="primary"
                icon="expand_more"
                label="Load more"
                :loading="loadingMore"
                @click="loadMore"
            />
        </div>
    </template>
</q-page>
</template>

<script setup>
import { useJunkList } from 'src/uses/junkListUse'
import JunkGallery from 'src/components/junk/JunkGallery.vue'

const {
    items,
    totalLoaded,
    totalCount,
    initialLoading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    openPreview,
    openEdit,
} = useJunkList()
</script>
