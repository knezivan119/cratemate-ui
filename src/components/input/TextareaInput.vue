<template>
<q-input
    v-bind="{ ...inputDefault, type: 'textarea', autogrow: true, ...$attrs }"
    v-model="model"
/>
</template>

<script setup>
import { inputDefault } from 'src/defaults/inputDefault'

defineOptions( { inheritAttrs: false } )
const model = defineModel()
</script>
