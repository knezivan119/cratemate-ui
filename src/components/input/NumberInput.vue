<template>
<q-input v-bind="bindings" v-model="proxy" />
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { inputDefault } from 'src/defaults/inputDefault'

defineOptions( { inheritAttrs: false } )
const model = defineModel()
const attrs = useAttrs()

// Coerce the DOM string back to a Number (or null when blank), so callers always
// see a numeric model value without having to add v-model.number.
const proxy = computed( {
    get: () => model.value,
    set: ( v ) => {
        model.value = ( v === '' || v === null || v === undefined ) ? null : Number( v )
    },
} )

const bindings = computed( () => ( { ...inputDefault, type: 'number', ...attrs } ) )
</script>
