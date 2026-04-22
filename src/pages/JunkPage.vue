<template>
<q-page padding>
    <div class="row items-center q-mb-md">
        <div class="text-h4">Junk</div>
        <q-space />
        <q-btn
            color="primary"
            icon="add"
            label="New Junk"
            @click="openCreate"
        />
    </div>

    <q-banner v-if="junkError" rounded class="bg-negative text-white q-mb-md">
        {{ junkError.message }}
    </q-banner>

    <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :loading="junkFetching"
        flat
        bordered
        :pagination="tablePagination"
        @request="onRequest"
    >
        <template #body-cell-thumb="props">
            <q-td :props="props" auto-width>
                <img
                    v-if="props.row.photos?.[ 0 ]?.thumb_url"
                    :src="props.row.photos[ 0 ].thumb_url"
                    alt=""
                    class="row-thumb"
                />
                <q-icon
                    v-else
                    name="image_not_supported"
                    size="32px"
                    color="grey-5"
                />
            </q-td>
        </template>

        <template #body-cell-crate="props">
            <q-td :props="props">
                {{ crateNameById( props.row.crate_id ) }}
            </q-td>
        </template>

        <template #body-cell-status="props">
            <q-td :props="props">
                <q-badge outline color="primary" :label="props.value" />
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
                No junk yet. Create your first one!
            </div>
        </template>
    </q-table>
</q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCrateStore } from 'src/stores/crate-store'
import { useJunkList, useDeleteJunk } from 'src/queries/junk'
import JunkFormDialog from 'src/components/JunkFormDialog.vue'

const $q         = useQuasar()
const crateStore = useCrateStore()

const page = ref( 1 )

const {
    data: junkResponse,
    error: junkError,
    isFetching: junkFetching,
} = useJunkList( page )

const { mutate: deleteJunkMutate } = useDeleteJunk()

const rows = computed( () => junkResponse.value?.data ?? [] )
const meta = computed( () => junkResponse.value?.meta ?? {
    page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
} )

const columns = [
    { name: 'thumb', label: '', field: 'thumb', align: 'left' },
    { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
    { name: 'crate', label: 'Crate', field: 'crate_id', align: 'left' },
    { name: 'description', label: 'Description', field: 'description', align: 'left' },
    { name: 'status', label: 'Status', field: 'status', align: 'left' },
    { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const tablePagination = computed( () => ( {
    page: meta.value.page,
    rowsPerPage: meta.value.per_page,
    rowsNumber: meta.value.total,
} ) )

function onRequest ( props ) {
    page.value = props.pagination.page
}

function crateNameById ( id ) {
    return crateStore.crates.find( ( c ) => c.id === id )?.name || '—'
}

function openCreate () {
    $q.dialog( {
        component: JunkFormDialog,
    } )
}

function openEdit ( junk ) {
    $q.dialog( {
        component: JunkFormDialog,
        componentProps: { junk },
    } )
}

function confirmDelete ( junk ) {
    $q.dialog( {
        title: 'Delete Junk',
        message: `Delete "${ junk.name }"? This cannot be undone.`,
        cancel: true,
        persistent: true,
    } ).onOk( () => {
        deleteJunkMutate( junk.id )
    } )
}

onMounted( () => {
    if ( !crateStore.crates.length ) {
        crateStore.fetchCrates()
    }
} )
</script>

<style scoped>
.row-thumb {
    display: block;
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 4px;
}
</style>
