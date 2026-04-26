<template>
<q-card style="max-width: 26.25rem; width: 100%;" class="q-mt-xl">
    <q-card-section>
        <div class="text-h5">Log in</div>
        <div class="text-caption text-grey-7">CrateMate</div>
    </q-card-section>

    <q-form @submit.prevent="submit">
        <q-card-section class="q-gutter-md">
            <TextInput
                v-model="form.email"
                label="Email"
                type="email"
                autocomplete="email"
                :rules="emailRules"
            />
            <TextInput
                v-model="form.password"
                label="Password"
                type="password"
                autocomplete="current-password"
                :rules="passwordRules"
            />
            <q-banner v-if="errorMessage" rounded class="bg-negative text-white">
                {{ errorMessage }}
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
</template>

<script setup>
import { useLogin } from 'src/uses/loginUse'
import TextInput from 'src/components/input/TextInput.vue'

const { form, loading, errorMessage, submit } = useLogin()

const emailRules    = [ ( val ) => !!val || 'Email is required' ]
const passwordRules = [ ( val ) => !!val || 'Password is required' ]
</script>
