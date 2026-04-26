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
            <q-item
                v-for="item in sidebarItems"
                :key="item.name"
                clickable
                :to="{ name: item.name }"
                :exact="item.exact"
            >
                <q-item-section avatar>
                    <q-icon :name="item.icon" />
                </q-item-section>
                <q-item-section>{{ item.label }}</q-item-section>
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
import { useAuthStore } from 'src/stores/authStore'
import routes from 'src/router/routes'

const leftDrawerOpen = ref( false )
const authStore      = useAuthStore()
const router         = useRouter()

// Pull every authenticated child-route flagged as `sidebar` straight from the
// route table. Adding a new sidebar entry is now "set sidebar: true on the
// route" — no edit here.
const sidebarItems = routes
    .find( ( r ) => Array.isArray( r.children ) )
    .children
    .filter( ( c ) => c.meta?.sidebar )
    .map( ( c ) => ( {
        name:  c.name,
        label: c.meta.label,
        icon:  c.meta.icon,
        exact: !!c.meta.exact,
    } ) )

function toggleLeftDrawer () {
    leftDrawerOpen.value = !leftDrawerOpen.value
}

async function onLogout () {
    await authStore.logout()
    router.replace( '/login' )
}
</script>
