<template>
<q-layout>
    <q-page-container>
        <q-page padding class="row justify-center items-start">
            <q-card style="max-width: 420px; width: 100%;" class="q-mt-xl">
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
                            :rules="[ ( val ) => !!val || 'Email is required' ]"
                        />
                        <TextInput
                            v-model="form.password"
                            label="Password"
                            type="password"
                            autocomplete="current-password"
                            :rules="[ ( val ) => !!val || 'Password is required' ]"
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
        </q-page>
    </q-page-container>
</q-layout>
</template>

<script setup>
import { useLogin } from 'src/uses/loginUse'
import TextInput from 'src/components/input/TextInput.vue'

const { form, loading, errorMessage, submit } = useLogin()
</script>
