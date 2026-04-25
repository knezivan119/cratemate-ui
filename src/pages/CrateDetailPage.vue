<template>
<q-page padding class="q-pb-xl">
    <div class="row items-center q-mb-md">
        <q-btn
            flat
            dense
            round
            icon="arrow_back"
            class="q-mr-sm"
            :to="parentRoute"
            aria-label="Back"
        />
        <div class="text-h5 ellipsis">
            {{ crate?.name || 'Loading…' }}
        </div>
    </div>

    <div v-if="crate?.type" class="q-mb-md">
        <q-chip
            :icon="iconForType( crate.type ).icon"
            :color="iconForType( crate.type ).color"
            text-color="white"
        >
            {{ crate.type }}
        </q-chip>
    </div>

    <q-banner v-if="loadError" rounded class="bg-negative text-white q-mb-md">
        {{ loadError.message || 'Failed to load' }}
    </q-banner>

    <div class="text-subtitle2 text-grey-7 q-mb-sm">Inside</div>
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
                <q-avatar :color="iconForType( child.type ).color" text-color="white" size="48px">
                    <q-icon :name="iconForType( child.type ).icon" />
                </q-avatar>
            </q-item-section>
            <q-item-section>
                <q-item-label class="text-body1">{{ child.name }}</q-item-label>
                <q-item-label v-if="child.type" caption>{{ child.type }}</q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-icon name="chevron_right" />
            </q-item-section>
        </q-item>

        <q-item v-if="!childrenLoading && children.length === 0">
            <q-item-section>
                <q-item-label class="text-grey-7">
                    No crates inside. Add one or start dropping in Junk.
                </q-item-label>
            </q-item-section>
        </q-item>
    </q-list>

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
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrate, useCrateChildren } from 'src/queries/crates'
import { iconForType } from 'src/utils/crateIcon'
import CrateFormDialog from 'src/components/CrateFormDialog.vue'
import JunkCaptureDialog from 'src/components/JunkCaptureDialog.vue'

const route = useRoute()
const $q    = useQuasar()

const crateId = computed( () => route.params.id )

const { data: crateData, error: crateError } = useCrate( crateId )
const { data: childrenData, isLoading: childrenLoading, error: childrenError } = useCrateChildren( crateId )

const crate    = computed( () => crateData.value?.data )
const children = computed( () => childrenData.value?.data ?? [] )

const loadError = computed( () => crateError.value || childrenError.value )

const parentRoute = computed( () => {
    const parentId = crate.value?.parent_id
    return parentId ? `/crates/${ parentId }` : '/crates'
} )

function openAddCrate () {
    $q.dialog( {
        component: CrateFormDialog,
        componentProps: { parentId: crateId.value },
    } )
}

function openAddJunk () {
    if ( !crate.value ) return
    $q.dialog( {
        component: JunkCaptureDialog,
        componentProps: {
            crateId:   crate.value.id,
            crateName: crate.value.name,
        },
    } )
}
</script>
