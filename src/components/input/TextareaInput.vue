<template>
<q-input
    v-bind="bindings"
    v-model="model"
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

const rootClasses = computed( () => [ 'textarea-input', `col-${ props.cols }` ] )
const bindings    = computed( () => ( { ...inputDefault, type: 'textarea', autogrow: true, ...attrs } ) )
</script>
