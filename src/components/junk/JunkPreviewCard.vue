<template>
<div class="junk-preview-card column no-wrap full-height">
    <q-banner v-if="loadError" rounded class="bg-negative text-white q-mb-md">
        {{ loadError.message || 'Failed to load' }}
    </q-banner>

    <q-card flat class="preview-photos col bg-black">
        <q-carousel
            v-if="photos.length > 0"
            v-model="slide"
            :arrows="photos.length > 1"
            :navigation="false"
            swipeable
            animated
            infinite
            height="100%"
            class="full-width"
        >
            <q-carousel-slide
                v-for="( photo, index ) in photos"
                :key="photo.id"
                :name="index"
                class="preview-slide"
                @click="openLightbox( photo )"
            >
                <q-img :src="photo.url" fit="contain" class="full-width full-height" />
            </q-carousel-slide>
        </q-carousel>

        <div v-else class="column flex-center full-width full-height text-grey-5">
            <q-icon name="image_not_supported" size="3rem" />
            <div class="text-caption q-mt-sm">No photos</div>
        </div>

        <div class="preview-overlay absolute-bottom column q-px-sm q-py-xs">
            <div class="text-subtitle1 text-white ellipsis">
                {{ junk?.name || '…' }}
            </div>

            <div class="row items-center no-wrap q-mt-xs">
                <div class="row items-center no-wrap col q-gutter-x-xs">
                    <q-chip
                        v-if="crate"
                        outline
                        dense
                        color="white"
                    >
                        <CrateTypeAvatar :crate="crate" size="1rem" class="q-mr-xs" />
                        <CrateNumber :crate="crate" class="q-mr-xs" />
                        <span class="preview-overlay-chip-name">{{ crate.name }}</span>
                    </q-chip>

                    <q-chip
                        outline
                        dense
                        color="white"
                        icon="inventory_2"
                    >
                        {{ junk?.quantity }} {{ junk?.unit || 'ea' }}
                    </q-chip>
                </div>

                <q-btn
                    dense
                    color="primary"
                    icon="edit"
                    label="Edit"
                    @click="$emit( 'edit' )"
                />
            </div>
        </div>
    </q-card>

    <div v-if="junk?.description" class="preview-description q-mt-sm">
        {{ junk.description }}
    </div>

    <div v-if="tags.length > 0" class="preview-tags q-mt-xs">
        <q-chip
            v-for="tag in tags"
            :key="tag.id"
            outline
            dense
            color="secondary"
        >
            {{ tag.name }}
        </q-chip>
    </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useJunkPreview } from 'src/uses/junkPreviewUse'
import CrateNumber       from 'src/components/crate/CrateNumber.vue'
import CrateTypeAvatar   from 'src/components/crate/CrateTypeAvatar.vue'
import JunkPhotoLightbox from 'src/components/junk/JunkPhotoLightbox.vue'

const props = defineProps( {
    junkId: {
        type:     String,
        required: true,
    },
} )

defineEmits( [ 'edit' ] )

const $q = useQuasar()

const junkIdRef = computed( () => props.junkId )
const {
    junk,
    crate,
    photos,
    tags,
    loadError,
} = useJunkPreview( junkIdRef )

const slide = ref( 0 )

function openLightbox ( photo ) {
    $q.dialog( {
        component: JunkPhotoLightbox,
        componentProps: {
            photo,
        },
    } )
}
</script>

<style scoped>
.preview-photos {
    overflow: hidden;
}
.preview-slide {
    padding: 0;
    background: transparent;
}
.preview-overlay {
    background: rgba( 0, 0, 0, 0.55 );
}
.preview-overlay-chip-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 10rem;
}
.preview-description {
    white-space: pre-wrap;
}
.preview-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
}
</style>
