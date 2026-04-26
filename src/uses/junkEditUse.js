import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import {
    useJunk,
    useUpdateJunk,
    useDeleteJunk,
} from 'src/queries/junkQuery'
import { useCrate } from 'src/queries/crateQuery'
import { useTagsList } from 'src/queries/tagQuery'
import CratePickerDialog from 'src/components/CratePickerDialog.vue'

export function useJunkEdit ( junkId ) {
    const $q = useQuasar()

    const { data: junkData, error: junkError } = useJunk( junkId )
    const junk = computed( () => junkData.value?.data )

    const currentCrateId = computed( () => junk.value?.crate_id ?? null )
    const { data: crateData, error: crateError } = useCrate( currentCrateId )
    const currentCrate = computed( () => crateData.value?.data )

    const { data: tagsData, isLoading: tagsLoading } = useTagsList()
    const tagOptions = computed( () =>
        ( tagsData.value?.data ?? [] ).map( ( t ) => ( {
            label: t.name,
            value: t.id,
        } ) ),
    )

    const updateJunk = useUpdateJunk()
    const deleteJunk = useDeleteJunk()

    const loadError = computed( () => junkError.value || crateError.value )

    const form = ref( {
        name:        '',
        description: '',
        quantity:    1,
        unit:        'ea',
        tags:        [],
        crate_id:    null,
    } )

    watch(
        junk,
        ( j ) => {
            if ( !j ) return
            form.value = {
                name:        j.name        || '',
                description: j.description || '',
                quantity:    j.quantity    || 1,
                unit:        j.unit        || 'ea',
                tags:        ( j.tags || [] ).map( ( t ) => t.id ),
                crate_id:    j.crate_id,
            }
        },
        { immediate: true },
    )

    const isDirty = computed( () => {
        if ( !junk.value ) return false
        const j = junk.value
        if ( form.value.name        !== ( j.name        || '' ) )  return true
        if ( form.value.description !== ( j.description || '' ) )  return true
        if ( form.value.quantity    !== ( j.quantity    || 1 ) )   return true
        if ( form.value.unit        !== ( j.unit        || 'ea' ) ) return true
        if ( form.value.crate_id    !== j.crate_id )                return true
        const serverTagIds = ( j.tags || [] ).map( ( t ) => t.id ).sort().join( ',' )
        const localTagIds  = [ ...form.value.tags ].sort().join( ',' )
        return serverTagIds !== localTagIds
    } )

    const saving       = ref( false )
    const errorMessage = ref( null )

    async function onSave () {
        saving.value       = true
        errorMessage.value = null
        try {
            await updateJunk.mutateAsync( {
                id:      junkId.value,
                payload: { ...form.value },
            } )
        }
        catch ( err ) {
            errorMessage.value = err?.body?.error?.message || err.message || 'Save failed'
        }
        finally {
            saving.value = false
        }
    }

    function confirmDelete ( onDeleted ) {
        $q.dialog( {
            title:      'Delete Junk',
            message:    `Delete "${ junk.value?.name }"? This cannot be undone.`,
            cancel:     true,
            persistent: true,
        } ).onOk( async () => {
            try {
                await deleteJunk.mutateAsync( junkId.value )
                onDeleted?.()
            }
            catch ( err ) {
                errorMessage.value = err?.body?.error?.message || err.message || 'Delete failed'
            }
        } )
    }

    function openCratePicker () {
        $q.dialog( { component: CratePickerDialog } )
            .onOk( ( picked ) => {
                form.value.crate_id = picked.id
            } )
    }

    return {
        junk,
        currentCrate,
        tagOptions,
        tagsLoading,
        loadError,
        form,
        isDirty,
        saving,
        errorMessage,
        onSave,
        confirmDelete,
        openCratePicker,
    }
}
