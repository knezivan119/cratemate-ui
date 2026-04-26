import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCrate, useCrateChildren, useUpdateCrate, useDeleteCrate } from 'src/queries/crateQuery'
import { useJunkListInCrate } from 'src/queries/junkQuery'
import CrateFormDialog from 'src/components/CrateFormDialog.vue'
import CratePickerDialog from 'src/components/CratePickerDialog.vue'
import JunkCaptureDialog from 'src/components/JunkCaptureDialog.vue'

export function useCrateEdit ( crateId ) {
    const router = useRouter()
    const $q     = useQuasar()

    const updateCrate = useUpdateCrate()
    const deleteCrate = useDeleteCrate()

    const { data: crateData,    error: crateError }    = useCrate( crateId )
    const { data: childrenData, error: childrenError } = useCrateChildren( crateId )
    const { data: junkData,     isLoading: junkLoading, error: junkError } = useJunkListInCrate( crateId )

    const crate     = computed( () => crateData.value?.data )
    const children  = computed( () => childrenData.value?.data ?? [] )
    const junkItems = computed( () => junkData.value?.data ?? [] )

    const loadError = computed( () => crateError.value || childrenError.value || junkError.value )

    const parentRoute = computed( () => {
        const parentId = crate.value?.parent_id
        return parentId ? `/crates/${ parentId }` : '/crates'
    } )

    function notifyError ( err, fallback ) {
        $q.notify( {
            color:   'negative',
            message: err?.body?.error?.message || err.message || fallback,
        } )
    }

    function openAddCrate () {
        $q.dialog( {
            component: CrateFormDialog,
            componentProps: { parentId: crateId.value },
        } )
    }

    function openAddJunk () {
        if ( !crate.value ) return
        $q.dialog( {
            component: JunkCaptureDialog,
            componentProps: {
                crateId:   crate.value.id,
                crateName: crate.value.name,
            },
        } )
    }

    function openEdit () {
        if ( !crate.value ) return
        $q.dialog( {
            component: CrateFormDialog,
            componentProps: { crate: crate.value },
        } )
    }

    function openMove () {
        if ( !crate.value ) return
        $q.dialog( { component: CratePickerDialog } )
            .onOk( async ( picked ) => {
                if ( !picked?.id || picked.id === crate.value.id ) return
                try {
                    await updateCrate.mutateAsync( {
                        id:      crate.value.id,
                        payload: { parent_id: picked.id },
                    } )
                }
                catch ( err ) {
                    notifyError( err, 'Move failed' )
                }
            } )
    }

    async function moveToRoot () {
        if ( !crate.value || !crate.value.parent_id ) return
        try {
            await updateCrate.mutateAsync( {
                id:      crate.value.id,
                payload: { parent_id: null },
            } )
        }
        catch ( err ) {
            notifyError( err, 'Move failed' )
        }
    }

    function confirmDelete () {
        if ( !crate.value ) return

        const hasChildren = children.value.length > 0
        const hasJunk     = junkItems.value.length > 0

        let message = `Delete "${ crate.value.name }"?`
        if ( hasChildren || hasJunk ) {
            message += ' Everything inside (sub-crates and junk) will be deleted with it.'
        }

        $q.dialog( {
            title:      'Delete crate',
            message,
            cancel:     true,
            persistent: true,
            ok:         { label: 'Delete', color: 'negative', flat: true },
        } ).onOk( async () => {
            const fallback = crate.value.parent_id ? `/crates/${ crate.value.parent_id }` : '/crates'
            try {
                await deleteCrate.mutateAsync( crate.value.id )
                router.replace( fallback )
            }
            catch ( err ) {
                notifyError( err, 'Delete failed' )
            }
        } )
    }

    return {
        crate,
        children,
        junkItems,
        junkLoading,
        loadError,
        parentRoute,
        openAddCrate,
        openAddJunk,
        openEdit,
        openMove,
        moveToRoot,
        confirmDelete,
    }
}
