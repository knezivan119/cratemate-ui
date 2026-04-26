// Single source of truth for the Crate `type` taxonomy.
// Keys match the API's accepted type values; consumers derive icon/color/label
// from this map and never hard-code a list of types elsewhere.
export const crateTypeData = {
    location: { icon: 'home',            color: 'blue-7',   label: 'Location' },
    room:     { icon: 'meeting_room',    color: 'green-7',  label: 'Room' },
    crate:    { icon: 'inventory_2',     color: 'amber-8',  label: 'Crate' },
    person:   { icon: 'person',          color: 'purple-7', label: 'Person' },
    vehicle:  { icon: 'directions_car',  color: 'red-7',    label: 'Vehicle' },
}

export const crateTypeFallback = { icon: 'folder', color: 'grey-7', label: 'Other' }

export function iconForType ( type ) {
    return crateTypeData[ type ] || crateTypeFallback
}

// Derived options for q-select / SelectInput. Stable order = object insertion order.
export const crateTypeOptions = Object.entries( crateTypeData ).map( ( [ value, meta ] ) => ( {
    label: meta.label,
    value,
} ) )
