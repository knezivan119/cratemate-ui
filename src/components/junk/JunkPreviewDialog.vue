<template>
<q-dialog
    ref="dialogRef"
    full-width
    full-height
    @hide="onDialogHide"
>
    <q-card class="junk-preview-dialog column no-wrap">
        <q-toolbar class="bg-primary text-white">
            <q-toolbar-title class="text-subtitle1 ellipsis">
                {{ title }}
            </q-toolbar-title>
            <q-btn
                flat
                round
                icon="close"
                aria-label="Close"
                @click="onDialogCancel"
            />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-sm">
            <JunkPreviewCard :junk-id="junkId" @edit="onEdit" />
        </q-card-section>
    </q-card>
</q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useRouter } from 'vue-router'
import { useJunk } from 'src/queries/junkQuery'
import JunkPreviewCard from 'src/components/junk/JunkPreviewCard.vue'

const props = defineProps( {
    junkId: {
        type:     String,
        required: true,
    },
} )

defineEmits( [ ...useDialogPluginComponent.emits ] )

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const router = useRouter()

const junkIdRef = computed( () => props.junkId )
const { data } = useJunk( junkIdRef )
const title = computed( () => data.value?.data?.name || 'Loading…' )

function onEdit () {
    router.push( `/junk/${ props.junkId }` )
    onDialogOK()
}
</script>


