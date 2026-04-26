<template>
<q-dialog
    ref="dialogRef"
    maximized
    @hide="onDialogHide"
>
    <q-card class="junk-photo-lightbox">
        <img
            :src="photo?.url"
            :alt="photo?.file_name"
            class="lightbox-image"
        />
        <q-btn
            round
            dense
            icon="close"
            class="close-button"
            aria-label="Close"
            @click="onDialogCancel"
        />
    </q-card>
</q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'

defineProps( {
    photo: {
        type:     Object,
        required: true,
    },
} )

defineEmits( [ ...useDialogPluginComponent.emits ] )

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent()
</script>

<style scoped>
.junk-photo-lightbox {
    background:      #000;
    width:           100vw;
    height:          100vh;
    display:         flex;
    align-items:     center;
    justify-content: center;
    position:        relative;
}
.lightbox-image {
    /* Bounded by the viewport; preserves aspect ratio. The flex parent
       centres the image both axes when there's letterboxing. */
    max-width:  100vw;
    max-height: 100vh;
    width:      auto;
    height:     auto;
    object-fit: contain;
    display:    block;
}
.close-button {
    position:   absolute;
    top:        0.5rem;
    right:      0.5rem;
    background: rgba( 0, 0, 0, 0.5 );
    color:      white;
}
</style>
