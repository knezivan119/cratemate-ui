<template>
<q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    class="junk-photo-lightbox"
>
    <q-card class="lightbox-card">
        <q-img
            :src="photo?.url"
            :alt="photo?.file_name"
            fit="contain"
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
.lightbox-card {
    background:  #000;
    max-width:   95vw;
    max-height:  95vh;
    position:    relative;
    overflow:    hidden;
}
.lightbox-image {
    max-width:   95vw;
    max-height:  95vh;
}
.close-button {
    position:    absolute;
    top:         0.5rem;
    right:       0.5rem;
    background:  rgba( 0, 0, 0, 0.5 );
    color:       white;
}
</style>
