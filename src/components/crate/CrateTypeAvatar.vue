<template>
<q-avatar
    :color="meta.colour"
    text-color="white"
    :size="size"
>
    <q-icon :name="meta.icon" />
</q-avatar>
</template>

<script setup>
import { computed } from 'vue'
import { iconForType } from 'src/data/crateTypeData'

// Accepts either the whole crate (preferred — caller doesn't pre-extract) or
// just a type string when that's all the caller has.
const props = defineProps( {
    crate: { type: Object, default: null },
    type:  { type: String, default: null },
    size:  { type: String, default: '3rem' },
} )

const typeKey = computed( () => props.crate?.type ?? props.type )
const meta    = computed( () => iconForType( typeKey.value ) )
</script>
