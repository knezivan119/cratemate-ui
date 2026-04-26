<template>
<q-dialog
    ref="dialogRef"
    :maximized="isMobile"
    @hide="onDialogHide"
>
    <q-card class="crate-picker-dialog column no-wrap" :class="{ 'desktop-card': !isMobile }">
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
                        <CrateTypeAvatar :crate="child" size="2.5rem" />
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
                            <span v-if="currentEntry">Nothing inside here yet.</span>
                            <span v-else>No crates yet — create your first below.</span>
                        </q-item-label>
                    </q-item-section>
                </q-item>

                <q-item
                    clickable
                    v-ripple
                    class="q-py-md text-primary"
                    @click="openCreateInPlace"
                >
                    <q-item-section avatar>
                        <q-avatar color="primary" text-color="white" size="2.5rem">
                            <q-icon name="add" />
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>
                            <span v-if="currentEntry">Create crate inside {{ currentEntry.name }}</span>
                            <span v-else>Create new root crate</span>
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card-section>
    </q-card>
</q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { useCrateDrilldown } from 'src/uses/crateDrilldownUse'
import CrateFormDialog from 'src/components/crate/CrateFormDialog.vue'
import CrateTypeAvatar from 'src/components/crate/CrateTypeAvatar.vue'

defineEmits( [ ...useDialogPluginComponent.emits ] )

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const $q = useQuasar()
const isMobile = computed( () => $q.platform.is.mobile )

const {
    path,
    currentEntry,
    currentId,
    children,
    error,
    isLoading,
    drillInto,
    goUp,
    goToDepth,
    reset,
} = useCrateDrilldown()

function select () {
    if ( !currentEntry.value ) return
    onDialogOK( {
        id:   currentEntry.value.id,
        name: currentEntry.value.name,
        type: currentEntry.value.type,
    } )
}

function openCreateInPlace () {
    $q.dialog( {
        component: CrateFormDialog,
        componentProps: { parentId: currentId.value },
    } )
        .onOk( ( created ) => {
            if ( created?.id ) {
                drillInto( created )
            }
        } )
}
</script>

<style scoped>
.desktop-card {
    width: 30rem;
    max-width: 95vw;
    max-height: 80vh;
}
</style>
