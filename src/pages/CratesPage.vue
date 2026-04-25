<template>
<q-page padding>
    <div class="row items-center q-mb-md">
        <div class="text-h5">Crates</div>
    </div>

    <q-banner v-if="error" rounded class="bg-negative text-white q-mb-md">
        {{ errorMessage }}
    </q-banner>

    <q-list separator bordered class="rounded-borders bg-white">
        <q-item
            v-for="crate in crates"
            :key="crate.id"
            clickable
            v-ripple
            class="q-py-md"
            :to="`/crates/${ crate.id }`"
        >
            <q-item-section avatar>
                <q-avatar :color="iconForType( crate.type ).color" text-color="white" size="48px">
                    <q-icon :name="iconForType( crate.type ).icon" />
                </q-avatar>
            </q-item-section>

            <q-item-section>
                <q-item-label class="text-body1">{{ crate.name }}</q-item-label>
                <q-item-label v-if="crate.type" caption>{{ crate.type }}</q-item-label>
            </q-item-section>

            <q-item-section side>
                <q-icon name="chevron_right" />
            </q-item-section>
        </q-item>

        <q-item v-if="!isLoading && crates.length === 0">
            <q-item-section>
                <q-item-label class="text-grey-7">
                    No crates yet. Create your first one below.
                </q-item-label>
            </q-item-section>
        </q-item>
    </q-list>

    <q-page-sticky position="bottom-right" :offset="[ 18, 18 ]">
        <q-btn
            fab
            color="primary"
            icon="add"
            label="Add Crate"
            @click="openAdd"
        />
    </q-page-sticky>
</q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useCrateChildren } from 'src/queries/crates'
import { iconForType } from 'src/utils/crateIcon'
import CrateFormDialog from 'src/components/CrateFormDialog.vue'

const $q = useQuasar()

const { data, isLoading, error } = useCrateChildren( null )

const crates = computed( () => data.value?.data ?? [] )

const errorMessage = computed( () => error.value?.message || 'Failed to load crates' )

function openAdd () {
    $q.dialog( {
        component: CrateFormDialog,
        componentProps: { parentId: null },
    } )
}
</script>
