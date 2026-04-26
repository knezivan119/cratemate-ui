<template>
<span class="crate-number">#{{ crate?.number }}</span>
</template>

<script setup>
defineProps( {
    crate: {
        type:    Object,
        default: null,
    },
} )
</script>

<style scoped>
.crate-number {
    font-weight: 600;
    color: var( --q-primary );
}
</style>
