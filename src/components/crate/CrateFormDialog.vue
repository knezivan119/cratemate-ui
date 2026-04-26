<template>
<q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="crate-form-dialog">
        <q-card-section>
            <div class="text-h6">{{ isEdit ? 'Edit Crate' : 'New Crate' }}</div>
        </q-card-section>

        <q-card-section>
            <CrateEditForm
                :crate="crate"
                :parent-id="parentId"
                @saved="onDialogOK"
                @cancel="onDialogCancel"
            />
        </q-card-section>
    </q-card>
</q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import CrateEditForm from 'src/components/crate/CrateEditForm.vue'

const props = defineProps( {
    crate:    { type: Object, default: null },
    parentId: { type: String, default: null },
} )

defineEmits( [ ...useDialogPluginComponent.emits ] )

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const isEdit = computed( () => !!props.crate )
</script>

<style scoped>
.crate-form-dialog {
    min-width: 20rem;
    max-width: 95vw;
    width: 30rem;
}
</style>
