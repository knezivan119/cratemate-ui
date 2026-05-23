<template>
<q-page padding class="crate-detail-view q-pb-xl">
    <div class="row items-center q-mb-md no-wrap">
        <q-btn
            flat
            dense
            round
            icon="arrow_back"
            class="q-mr-sm"
            :to="parentRoute"
            aria-label="Back"
        />
        <div class="text-h5 ellipsis col">
            <CrateNumber v-if="crate" :crate="crate" class="q-mr-sm" />
            {{ crate?.name || 'Loading…' }}
        </div>
        <q-btn
            v-if="crate"
            flat
            dense
            round
            icon="more_vert"
            aria-label="Crate actions"
        >
            <q-menu>
                <q-list class="actions-list">
                    <q-item clickable v-close-popup @click="openEdit">
                        <q-item-section avatar><q-icon name="edit" /></q-item-section>
                        <q-item-section>Rename / Edit</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="openMove">
                        <q-item-section avatar><q-icon name="folder_open" /></q-item-section>
                        <q-item-section>Move to another crate</q-item-section>
                    </q-item>
                    <q-item
                        v-if="crate.parent_id"
                        clickable
                        v-close-popup
                        @click="moveToRoot"
                    >
                        <q-item-section avatar><q-icon name="vertical_align_top" /></q-item-section>
                        <q-item-section>Make a root crate</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                        clickable
                        v-close-popup
                        class="text-negative"
                        @click="confirmDelete"
                    >
                        <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                        <q-item-section>Delete</q-item-section>
                    </q-item>
                </q-list>
            </q-menu>
        </q-btn>
    </div>

    <div v-if="crate?.type" class="q-mb-md">
        <CrateTypeChip :crate="crate" />
    </div>

    <q-banner v-if="loadError" rounded class="bg-negative text-white q-mb-md">
        {{ loadError.message || 'Failed to load' }}
    </q-banner>

    <template v-if="children.length > 0">
        <div class="text-subtitle2 text-grey-7 q-mb-sm">Crates inside</div>
        <q-list separator bordered class="rounded-borders bg-white q-mb-lg">
            <q-item
                v-for="child in children"
                :key="child.id"
                clickable
                v-ripple
                class="q-py-md"
                :to="`/crates/${ child.id }`"
            >
                <q-item-section avatar>
                    <CrateTypeAvatar :crate="child" />
                </q-item-section>
                <q-item-section>
                    <q-item-label class="text-body1">
                        <CrateNumber :crate="child" class="q-mr-sm" />
                        {{ child.name }}
                    </q-item-label>
                    <q-item-label v-if="child.type" caption>{{ child.type }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-icon name="chevron_right" />
                </q-item-section>
            </q-item>
        </q-list>
    </template>

    <div class="text-subtitle2 text-grey-7 q-mb-sm">Junk inside</div>
    <div v-if="!junkLoading && junkItems.length === 0" class="text-grey-7 q-mb-lg">
        Nothing here yet. Tap "Add Junk" below to start.
    </div>
    <JunkGallery
        v-else
        :items="junkItems"
        class="q-mb-lg"
        @select="goToJunk"
    />

    <q-page-sticky position="bottom" :offset="[ 0, 16 ]" expand>
        <div class="row q-col-gutter-sm full-width q-px-md">
            <div class="col">
                <q-btn
                    color="secondary"
                    icon="folder_open"
                    label="Add Crate"
                    class="full-width"
                    size="lg"
                    @click="openAddCrate"
                />
            </div>
            <div class="col">
                <q-btn
                    color="primary"
                    icon="add_a_photo"
                    label="Add Junk"
                    class="full-width"
                    size="lg"
                    @click="openAddJunk"
                />
            </div>
        </div>
    </q-page-sticky>
</q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCrateEdit } from 'src/uses/crateEditUse'
import CrateTypeAvatar from 'src/components/crate/CrateTypeAvatar.vue'
import CrateTypeChip   from 'src/components/crate/CrateTypeChip.vue'
import CrateNumber     from 'src/components/crate/CrateNumber.vue'
import JunkGallery     from 'src/components/junk/JunkGallery.vue'

const props = defineProps( {
    crateId: {
        type:     String,
        required: true,
    },
} )

const router = useRouter()

// Composables expect a Ref<string>; props are values. Wrap at the boundary.
const crateIdRef = computed( () => props.crateId )

const {
    crate,
    children,
    junkItems,
    junkLoading,
    loadError,
    parentRoute,
    openAddCrate,
    openAddJunk,
    openEdit,
    openMove,
    moveToRoot,
    confirmDelete,
} = useCrateEdit( crateIdRef )

function goToJunk ( item ) {
    router.push( `/junk/${ item.id }` )
}
</script>

<style scoped>
.actions-list {
    min-width: 13.75rem;
}
</style>
