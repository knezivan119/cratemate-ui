<template>
<q-input
    v-bind="{ ...inputDefault, type: 'number', ...$attrs }"
    v-model="proxy"
/>
</template>

<script setup>
import { computed } from 'vue'
import { inputDefault } from 'src/defaults/inputDefault'

defineOptions( { inheritAttrs: false } )
const model = defineModel()

// Coerce string from the DOM input to a Number (or null when blank), so callers
// always see a numeric model value without having to add v-model.number.
const proxy = computed( {
    get: () => model.value,
    set: ( v ) => {
        model.value = ( v === '' || v === null || v === undefined ) ? null : Number( v )
    },
} )
</script>
