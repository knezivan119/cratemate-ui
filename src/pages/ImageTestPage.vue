<template>
<q-page padding>
    <div class="text-h4 q-mb-md">Image Test</div>

    <div v-if="cameraSupported" class="row q-gutter-md items-start">
        <div class="col-auto">
            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                capture="environment"
                style="display: none"
                @change="onCapture"
            >
            <q-btn
                color="primary"
                icon="camera_alt"
                label="Take Photo"
                @click="fileInput.click()"
            />
        </div>

        <div v-if="imageUrl" class="col-auto">
            <img
                :src="imageUrl"
                alt="Captured photo"
                style="max-width: 400px; max-height: 400px; border-radius: 8px;"
            >
        </div>
    </div>

    <q-banner v-else rounded class="bg-warning text-white">
        <template #avatar>
            <q-icon name="no_photography" />
        </template>
        Camera capture is not supported on this device or browser.
    </q-banner>
</q-page>
</template>

<script setup>
import { ref } from 'vue'

const fileInput = ref( null )
const imageUrl = ref( null )

const cameraSupported = typeof window !== 'undefined'
    && !!window.isSecureContext
    && typeof HTMLInputElement !== 'undefined'

function onCapture ( event ) {
    const file = event.target.files?.[ 0 ]
    if ( !file ) return

    if ( imageUrl.value ) {
        URL.revokeObjectURL( imageUrl.value )
    }

    imageUrl.value = URL.createObjectURL( file )
}
</script>
