<template>
<q-input
    v-bind="bindings"
    v-model="proxy"
    :class="rootClasses"
/>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { inputDefault } from 'src/defaults/inputDefault'

defineOptions( { inheritAttrs: false } )
const model = defineModel()
const attrs = useAttrs()

const props = defineProps( {
    cols: { type: [ String, Number ], default: 12 },
} )

// Coerce the DOM string back to a Number (or null when blank), so callers always
// see a numeric model value without having to add v-model.number.
const proxy = computed( {
    get: () => model.value,
    set: ( v ) => {
        model.value = ( v === '' || v === null || v === undefined ) ? null : Number( v )
    },
} )

const rootClasses = computed( () => [ 'number-input', `col-${ props.cols }` ] )
const bindings    = computed( () => ( { ...inputDefault, type: 'number', ...attrs } ) )
</script>
