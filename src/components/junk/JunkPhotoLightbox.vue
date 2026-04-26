<template>
<q-dialog
    ref="dialogRef"
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
    background: #000;
    position:   relative;
    /* The card sizes itself to its content (the image). The image is the
       sized element — see .lightbox-image below. */
}
.lightbox-image {
    display:    block;
    /* The image sizes to its natural dimensions, capped to the viewport so
       it never overflows. q-dialog's outer wrapper centres it. */
    max-width:  95vw;
    max-height: 95vh;
    width:      auto;
    height:     auto;
    object-fit: contain;
}
.close-button {
    position:   absolute;
    top:        0.5rem;
    right:      0.5rem;
    background: rgba( 0, 0, 0, 0.5 );
    color:      white;
}
</style>
