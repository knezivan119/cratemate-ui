<template>
<q-dialog
    ref="dialogRef"
    :maximized="isMobile"
    @hide="onDialogHide"
>
    <q-card class="column no-wrap" :class="{ 'desktop-card': !isMobile }">
        <q-toolbar class="bg-primary text-white">
            <q-btn
                flat
                round
                icon="arrow_back"
                :disable="path.length === 0"
                aria-label="Up"
                @click="goUp"
            />
            <q-toolbar-title class="text-subtitle1">Choose a crate</q-toolbar-title>
            <q-btn
                flat
                round
                icon="close"
                aria-label="Close"
                @click="onDialogCancel"
            />
        </q-toolbar>

        <q-card-section class="q-pb-sm">
            <q-breadcrumbs class="text-body2">
                <q-breadcrumbs-el
                    label="Crates"
                    icon="folder"
                    :class="{ 'cursor-pointer': path.length > 0 }"
                    @click="reset"
                />
                <q-breadcrumbs-el
                    v-for="( entry, idx ) in path"
                    :key="entry.id"
                    :label="entry.name"
                    :class="{ 'cursor-pointer': idx < path.length - 1 }"
                    @click="goToDepth( idx )"
                />
            </q-breadcrumbs>
        </q-card-section>

        <q-card-section v-if="currentEntry" class="q-pt-none">
            <q-btn
                color="primary"
                icon="check"
                :label="`Put here: ${ currentEntry.name }`"
                class="full-width"
                size="md"
                @click="select"
            />
        </q-card-section>

        <q-separator />

        <q-card-section class="col scroll q-pa-none">
            <q-banner v-if="error" rounded class="bg-negative text-white q-ma-md">
                {{ error.message || 'Failed to load' }}
            </q-banner>

            <q-list separator>
                <q-item
                    v-for="child in children"
                    :key="child.id"
                    clickable
                    v-ripple
                    class="q-py-md"
                    @click="drillInto( child )"
                >
                    <q-item-section avatar>
                        <q-avatar
                            :color="iconForType( child.type ).color"
                            text-color="white"
                            size="40px"
                        >
                            <q-icon :name="iconForType( child.type ).icon" />
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ child.name }}</q-item-label>
                        <q-item-label v-if="child.type" caption>{{ child.type }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-icon name="chevron_right" />
                    </q-item-section>
                </q-item>

                <q-item v-if="!isLoading && children.length === 0">
                    <q-item-section>
                        <q-item-label class="text-grey-7">
                            <span v-if="currentEntry">Nothing inside here.</span>
                            <span v-else>No crates yet — create one first.</span>
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card-section>
    </q-card>
</q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { useCrateChildren } from 'src/queries/crates'
import { iconForType } from 'src/utils/crateIcon'

defineEmits( [ ...useDialogPluginComponent.emits ] )

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const $q = useQuasar()
const isMobile = computed( () => $q.platform.is.mobile )

// `path` is the breadcrumb trail of crates we've drilled into. Each entry is { id, name, type }.
// Empty path = at root (showing root crates).
const path = ref( [] )

const currentEntry = computed( () => path.value[ path.value.length - 1 ] || null )
const currentId    = computed( () => currentEntry.value?.id ?? null )

const { data, error, isLoading } = useCrateChildren( currentId )
const children = computed( () => data.value?.data ?? [] )

function drillInto ( crate ) {
    path.value.push( { id: crate.id, name: crate.name, type: crate.type } )
}

function goUp () {
    path.value.pop()
}

function goToDepth ( idx ) {
    path.value = path.value.slice( 0, idx + 1 )
}

function reset () {
    path.value = []
}

function select () {
    if ( !currentEntry.value ) return
    onDialogOK( {
        id:   currentEntry.value.id,
        name: currentEntry.value.name,
        type: currentEntry.value.type,
    } )
}
</script>

<style scoped>
.desktop-card {
    width: 480px;
    max-width: 95vw;
    max-height: 80vh;
}
</style>
