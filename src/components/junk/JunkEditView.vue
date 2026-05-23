<template>
<q-page padding class="junk-edit-view q-pb-xl">
    <div class="row items-center q-mb-md">
        <q-btn
            flat
            dense
            round
            icon="arrow_back"
            class="q-mr-sm"
            aria-label="Back"
            @click="goBack"
        />
        <div class="text-h5 ellipsis">
            {{ title }}
        </div>
    </div>

    <JunkEditCard :junk-id="junkId" @deleted="onDeleted" />
</q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJunk } from 'src/queries/junkQuery'
import JunkEditCard from 'src/components/junk/JunkEditCard.vue'

const props = defineProps( {
    junkId: {
        type:     String,
        required: true,
    },
} )

const router = useRouter()

const junkIdRef = computed( () => props.junkId )
const { data } = useJunk( junkIdRef )
const title = computed( () => data.value?.data?.name || 'Loading…' )

function goBack () {
    if ( window.history.length > 1 ) router.back()
    else router.replace( '/junk' )
}

function onDeleted () {
    router.replace( '/junk' )
}
</script>
