<template>
<JunkEditView :junk-id="junkId" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import JunkEditView from 'src/components/junk/JunkEditView.vue'

const route  = useRoute()
const junkId = computed( () => route.params.id )
</script>
