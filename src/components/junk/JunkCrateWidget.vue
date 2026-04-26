<template>
<q-card flat bordered class="junk-crate-widget">
    <q-card-section class="row items-center q-py-sm">
        <CrateTypeAvatar
            :crate="currentCrate"
            size="2.25rem"
            class="q-mr-md"
        />
        <div class="col">
            <div>{{ currentCrate?.name || '…' }}</div>
            <div v-if="currentCrate?.type" class="text-caption text-grey-7">
                {{ currentCrate.type }}
            </div>
        </div>
        <q-btn
            flat
            color="primary"
            icon="folder_open"
            label="Change"
            @click="openPicker"
        />
    </q-card-section>
</q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useCrate } from 'src/queries/crateQuery'
import CratePickerDialog from 'src/components/crate/CratePickerDialog.vue'
import CrateTypeAvatar from 'src/components/crate/CrateTypeAvatar.vue'

// v-model on the crate id — anyone with a crate-id ref can drop this widget in
// and get "show current crate + change via picker dialog" out of the box.
const crateId = defineModel( {
    type:    String,
    default: null,
} )

const $q = useQuasar()

const crateIdRef = computed( () => crateId.value )
const { data } = useCrate( crateIdRef )
const currentCrate = computed( () => data.value?.data )

function openPicker () {
    $q.dialog( {
        component: CratePickerDialog,
    } ).onOk( ( picked ) => {
        if ( picked?.id ) crateId.value = picked.id
    } )
}
</script>
