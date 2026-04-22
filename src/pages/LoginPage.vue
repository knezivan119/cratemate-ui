<template>
<q-layout>
    <q-page-container>
        <q-page padding class="row justify-center items-start">
            <q-card style="max-width: 420px; width: 100%;" class="q-mt-xl">
                <q-card-section>
                    <div class="text-h5">Log in</div>
                    <div class="text-caption text-grey-7">CrateMate</div>
                </q-card-section>

                <q-form @submit.prevent="onSubmit">
                    <q-card-section class="q-gutter-md">
                        <q-input
                            v-model="form.email"
                            label="Email"
                            outlined
                            type="email"
                            autocomplete="email"
                            :rules="[ ( val ) => !!val || 'Email is required' ]"
                        />
                        <q-input
                            v-model="form.password"
                            label="Password"
                            outlined
                            type="password"
                            autocomplete="current-password"
                            :rules="[ ( val ) => !!val || 'Password is required' ]"
                        />
                        <q-banner v-if="error" rounded class="bg-negative text-white">
                            {{ error }}
                        </q-banner>
                    </q-card-section>

                    <q-card-actions align="right" class="q-pa-md">
                        <q-btn
                            color="primary"
                            label="Log in"
                            type="submit"
                            :loading="loading"
                        />
                    </q-card-actions>
                </q-form>
            </q-card>
        </q-page>
    </q-page-container>
</q-layout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth-store'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const form = reactive( {
    email: '',
    password: '',
} )
const loading = ref( false )
const error   = ref( null )

async function onSubmit () {
    loading.value = true
    error.value   = null
    try {
        await authStore.login( form )
        const redirect = typeof route.query.redirect === 'string'
            ? route.query.redirect
            : '/'
        router.replace( redirect )
    }
    catch ( err ) {
        error.value = err?.body?.error?.message || err.message || 'Login failed'
    }
    finally {
        loading.value = false
    }
}
</script>
