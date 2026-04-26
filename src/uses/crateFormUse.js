import { ref, reactive, watch } from 'vue'
import { useCreateCrate, useUpdateCrate } from 'src/queries/crateQuery'

export function useCrateForm ( { crate, parentId, onSaved } ) {
    const createCrate = useCreateCrate()
    const updateCrate = useUpdateCrate()

    const form = reactive( {
        name:        '',
        type:        null,
        description: '',
    } )

    // Sync form from the (possibly-async) crate prop.
    watch(
        () => crate.value,
        ( c ) => {
            form.name        = c?.name        || ''
            form.type        = c?.type        || null
            form.description = c?.description || ''
        },
        { immediate: true },
    )

    const saving       = ref( false )
    const errorMessage = ref( null )

    async function submit () {
        saving.value       = true
        errorMessage.value = null
        try {
            const result = crate.value
                ? await updateCrate.mutateAsync( {
                    id: crate.value.id,
                    payload: {
                        ...form,
                    },
                } )
                : await createCrate.mutateAsync( {
                    ...form,
                    parent_id: parentId.value,
                } )

            onSaved?.( result?.data )
        }
        catch ( err ) {
            errorMessage.value = err?.body?.error?.message || err.message || 'Save failed'
        }
        finally {
            saving.value = false
        }
    }

    return {
        form,
        saving,
        errorMessage,
        submit,
    }
}
