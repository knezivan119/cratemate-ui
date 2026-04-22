<template>
<q-page padding>
    <div class="text-h4 q-mb-md">Image Test</div>

    <q-banner v-if="!supported" rounded class="bg-warning text-white">
        <template #avatar>
            <q-icon name="no_photography" />
        </template>
        Camera capture is not supported in this browser.
    </q-banner>

    <template v-else>
        <q-banner v-if="error" rounded class="bg-negative text-white q-mb-md">
            <template #avatar>
                <q-icon name="error" />
            </template>
            {{ error }}
        </q-banner>

        <div class="row q-gutter-md items-center q-mb-md">
            <q-btn
                v-if="!streaming"
                color="primary"
                icon="videocam"
                label="Start camera"
                @click="startCamera"
            />
            <q-btn
                v-else
                color="grey-7"
                icon="videocam_off"
                label="Stop"
                @click="stopCamera"
            />
            <q-btn
                color="primary"
                icon="camera"
                label="Capture"
                :disable="!streaming"
                @click="capture"
            />
            <q-select
                v-if="devices.length > 1"
                v-model="deviceId"
                :options="deviceOptions"
                label="Camera"
                emit-value
                map-options
                outlined
                dense
                style="min-width: 240px"
                @update:model-value="restartIfStreaming"
            />
        </div>

        <div class="row q-gutter-md items-start">
            <div class="col-auto">
                <div class="text-subtitle2 q-mb-xs">Live preview</div>
                <video
                    ref="videoEl"
                    autoplay
                    playsinline
                    muted
                    class="preview"
                />
            </div>

            <div v-if="lastCapture" class="col-auto">
                <div class="text-subtitle2 q-mb-xs">
                    Last capture — {{ lastCapture.size }}
                </div>
                <img
                    :src="lastCapture.url"
                    alt="Last captured frame"
                    class="capture"
                />
            </div>
        </div>
    </template>
</q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useCamera } from 'src/composables/useCamera'

const {
    videoEl,
    streaming,
    error,
    devices,
    deviceId,
    lastCapture,
    supported,
    startCamera,
    stopCamera,
    capture,
    restartIfStreaming,
} = useCamera()

const deviceOptions = computed( () =>
    devices.value.map( ( d, i ) => ( {
        label: d.label || `Camera ${ i + 1 }`,
        value: d.deviceId,
    } ) ),
)
</script>

<style scoped>
.preview {
    width: 100%;
    max-width: 480px;
    background: #000;
    border-radius: 8px;
    aspect-ratio: 4 / 3;
    object-fit: contain;
    display: block;
}
.capture {
    width: 100%;
    max-width: 400px;
    max-height: 400px;
    border-radius: 8px;
    display: block;
}
</style>
