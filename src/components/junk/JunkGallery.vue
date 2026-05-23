<template>
<div v-if="items.length > 0" class="junk-gallery">
    <div
        v-for="item in items"
        :key="item.id"
        class="gallery-cell"
    >
        <button
            type="button"
            class="gallery-frame"
            :aria-label="item.name"
            @click="$emit( 'select', item )"
        >
            <img
                v-if="item.photos?.[ 0 ]?.thumb_url"
                :src="item.photos[ 0 ].thumb_url"
                :alt="item.name"
                class="gallery-image"
            />
            <div v-else class="gallery-placeholder">
                <q-icon name="image_not_supported" size="2rem" color="grey-5" />
            </div>
            <div class="gallery-overlay">{{ item.name }}</div>
        </button>

        <q-btn
            v-if="showEdit"
            round
            dense
            size="sm"
            color="primary"
            icon="edit"
            class="gallery-edit"
            aria-label="Edit"
            @click="$emit( 'edit', item )"
        />

        <div v-if="showCrate && item.crate" class="gallery-caption">
            <CrateNumber :crate="item.crate" class="q-mr-xs" />
            <span class="gallery-caption-name">{{ item.crate.name }}</span>
        </div>
    </div>
</div>
</template>

<script setup>
import CrateNumber from 'src/components/crate/CrateNumber.vue'

defineProps( {
    items: {
        type:     Array,
        required: true,
    },
    showEdit: {
        type:    Boolean,
        default: false,
    },
    showCrate: {
        type:    Boolean,
        default: false,
    },
} )

defineEmits( [ 'select', 'edit' ] )
</script>

<style scoped>
.junk-gallery {
    display: grid;
    grid-template-columns: repeat( auto-fill, minmax( 7.5rem, 1fr ) );
    gap: 0.5rem;
}
.gallery-cell {
    position: relative;
    border-radius: 0.375rem;
    overflow: hidden;
    background: #f4f4f4;
    display: flex;
    flex-direction: column;
}
.gallery-frame {
    position: relative;
    aspect-ratio: 1 / 1;
    width: 100%;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    display: block;
    color: inherit;
}
.gallery-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
.gallery-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ececec;
}
.gallery-overlay {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba( 0, 0, 0, 0.6 );
    color: #fff;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.gallery-edit {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
}
.gallery-caption {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    line-height: 1.3;
    background: #fafafa;
    display: flex;
    align-items: center;
    min-width: 0;
}
.gallery-caption-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
