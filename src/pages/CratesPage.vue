<template>
<q-page padding>
    <div class="row items-center q-mb-md">
        <div class="text-h4">Crates</div>
        <q-space />
        <q-btn
            color="primary"
            icon="add"
            label="New Crate"
            @click="openCreate"
        />
    </div>

    <q-banner v-if="crateStore.error" rounded class="bg-negative text-white q-mb-md">
        {{ crateStore.error }}
    </q-banner>

    <q-table
        :rows="crateStore.crates"
        :columns="columns"
        row-key="id"
        :loading="crateStore.loading"
        flat
        bordered
        :pagination="tablePagination"
        @request="onRequest"
    >
        <template #body-cell-type="props">
            <q-td :props="props">
                <q-badge
                    v-if="props.value"
                    outline
                    color="primary"
                    :label="props.value"
                />
                <span v-else class="text-grey-5">--</span>
            </q-td>
        </template>

        <template #body-cell-actions="props">
            <q-td :props="props" auto-width>
                <q-btn
                    flat
                    dense
                    icon="edit"
                    color="primary"
                    @click="openEdit( props.row )"
                />
                <q-btn
                    flat
                    dense
                    icon="delete"
                    color="negative"
                    @click="confirmDelete( props.row )"
                />
            </q-td>
        </template>

        <template #no-data>
            <div class="full-width row flex-center text-grey-7 q-pa-lg">
                No crates yet. Create your first one!
            </div>
        </template>
    </q-table>
</q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCrateStore } from 'src/stores/crate-store'
import CrateFormDialog from 'src/components/CrateFormDialog.vue'

const $q = useQuasar()
const crateStore = useCrateStore()

const columns = [
    { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
    { name: 'type', label: 'Type', field: 'type', align: 'left' },
    { name: 'description', label: 'Description', field: 'description', align: 'left' },
    { name: 'status', label: 'Status', field: 'status', align: 'left' },
    { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const tablePagination = computed( () => ( {
    page: crateStore.meta.page,
    rowsPerPage: crateStore.meta.per_page,
    rowsNumber: crateStore.meta.total,
} ) )

function onRequest ( props ) {
    crateStore.fetchCrates( props.pagination.page )
}

function openCreate () {
    $q.dialog( {
        component: CrateFormDialog,
    } )
}

function openEdit ( crate ) {
    $q.dialog( {
        component: CrateFormDialog,
        componentProps: { crate },
    } )
}

function confirmDelete ( crate ) {
    $q.dialog( {
        title: 'Delete Crate',
        message: `Delete "${crate.name}"? This cannot be undone.`,
        cancel: true,
        persistent: true,
    } ).onOk( () => {
        crateStore.deleteCrate( crate.id )
    } )
}

onMounted( () => {
    crateStore.fetchCrates()
} )
</script>
