import { ref, computed } from 'vue'
import { useCrateChildren } from 'src/queries/crateQuery'

// Path-based crate drilldown: a stack of { id, name, type } entries representing
// the user's current trail. Empty stack = root.
export function useCrateDrilldown () {
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

    return {
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
    }
}
