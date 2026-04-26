<template>
<q-chip
    class="crate-type-chip"
    :icon="meta.icon"
    :color="meta.colour"
    text-color="white"
>
    {{ label }}
</q-chip>
</template>

<script setup>
import { computed } from 'vue'
import { iconForType } from 'src/data/crateTypeData'

const props = defineProps( {
    crate: {
        type:    Object,
        default: null,
    },
    type: {
        type:    String,
        default: null,
    },
} )

const typeKey = computed( () => props.crate?.type ?? props.type )
const meta    = computed( () => iconForType( typeKey.value ) )
const label   = computed( () => typeKey.value || meta.value.label )
</script>
