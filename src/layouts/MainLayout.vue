<template>
<q-layout view="lHh Lpr lFf">
    <q-header elevated>
        <q-toolbar>
            <q-btn
                flat
                dense
                round
                icon="menu"
                aria-label="Menu"
                @click="toggleLeftDrawer"
            />

            <q-toolbar-title>
                Cratemate
            </q-toolbar-title>

            <div v-if="authStore.user" class="row items-center q-gutter-sm">
                <div class="text-body2">{{ authStore.user.name }}</div>
                <q-btn
                    flat
                    dense
                    round
                    icon="logout"
                    aria-label="Log out"
                    @click="onLogout"
                />
            </div>
        </q-toolbar>
    </q-header>

    <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
    >
        <q-list>
            <q-item-label header>Navigation</q-item-label>

            <q-item clickable :to="'/'" exact>
                <q-item-section avatar>
                    <q-icon name="dashboard" />
                </q-item-section>
                <q-item-section>Dashboard</q-item-section>
            </q-item>

            <q-item clickable :to="'/crates'">
                <q-item-section avatar>
                    <q-icon name="inventory_2" />
                </q-item-section>
                <q-item-section>Crates</q-item-section>
            </q-item>

            <q-item clickable :to="'/junk'">
                <q-item-section avatar>
                    <q-icon name="widgets" />
                </q-item-section>
                <q-item-section>Junk</q-item-section>
            </q-item>
        </q-list>
    </q-drawer>

    <q-page-container>
        <router-view />
    </q-page-container>
</q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth-store'

const leftDrawerOpen = ref( false )
const authStore      = useAuthStore()
const router         = useRouter()

function toggleLeftDrawer () {
    leftDrawerOpen.value = !leftDrawerOpen.value
}

async function onLogout () {
    await authStore.logout()
    router.replace( '/login' )
}
</script>
