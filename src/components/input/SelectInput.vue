<template>
<q-select
    v-bind="{ ...inputDefault, 'emit-value': true, 'map-options': true, ...$attrs }"
    v-model="model"
/>
</template>

<script setup>
import { inputDefault } from 'src/defaults/inputDefault'

defineOptions( { inheritAttrs: false } )
const model = defineModel()
</script>
