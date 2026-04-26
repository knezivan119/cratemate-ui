<template>
<CrateDetailView :crate-id="crateId" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CrateDetailView from 'src/components/crate/CrateDetailView.vue'

const route   = useRoute()
const crateId = computed( () => route.params.id )
</script>
