<template>
<q-page padding>
    <div class="row items-center q-mb-md">
        <div class="text-h5">Junk</div>
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
        @row-click="onRowClick"
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

        <template #body-cell-status="props">
            <q-td :props="props">
                <q-badge outline color="primary" :label="props.value" />
            </q-td>
        </template>

        <template #no-data>
            <div class="full-width row flex-center text-grey-7 q-pa-lg">
                No junk yet. Open a crate and tap "Add Junk" to start.
            </div>
        </template>
    </q-table>
</q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJunkList } from 'src/queries/junk'

const router = useRouter()
const page   = ref( 1 )

const {
    data: junkResponse,
    error: junkError,
    isFetching: junkFetching,
} = useJunkList( page )

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
    { name: 'description', label: 'Description', field: 'description', align: 'left' },
    { name: 'quantity', label: 'Qty', field: ( row ) => `${ row.quantity } ${ row.unit || 'ea' }`, align: 'right' },
    { name: 'status', label: 'Status', field: 'status', align: 'left' },
]

const tablePagination = computed( () => ( {
    page: meta.value.page,
    rowsPerPage: meta.value.per_page,
    rowsNumber: meta.value.total,
} ) )

function onRequest ( props ) {
    page.value = props.pagination.page
}

function onRowClick ( _evt, row ) {
    router.push( `/junk/${ row.id }` )
}
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
