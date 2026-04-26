<template>
<q-select v-bind="bindings" v-model="model" />
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { inputDefault } from 'src/defaults/inputDefault'

defineOptions( { inheritAttrs: false } )
const model = defineModel()
const attrs = useAttrs()

const bindings = computed( () => ( { ...inputDefault, 'emit-value': true, 'map-options': true, ...attrs } ) )
</script>
