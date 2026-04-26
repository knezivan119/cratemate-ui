<template>
<q-select
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
    cols: {
        type:    [ String, Number ],
        default: 12,
    },
} )

const rootClasses = computed( () => [ 'select-input', `col-${ props.cols }` ] )
const bindings    = computed( () => ( {
    ...inputDefault,
    'emit-value':  true,
    'map-options': true,
    ...attrs,
} ) )
</script>
