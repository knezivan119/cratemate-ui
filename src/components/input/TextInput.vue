<template>
<q-input
    v-bind="{ ...inputDefault, ...$attrs }"
    v-model="model"
/>
</template>

<script setup>
import { inputDefault } from 'src/defaults/inputDefault'

defineOptions( { inheritAttrs: false } )
const model = defineModel()
</script>
