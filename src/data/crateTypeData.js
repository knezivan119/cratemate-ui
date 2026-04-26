// Single source of truth for the Crate `type` taxonomy.
// Keys match the API's accepted type values; consumers derive icon/colour/label
// from this map and never hard-code a list of types elsewhere.
export const crateTypeData = {
    location: {
        icon:   'home',
        colour: 'blue-7',
        label:  'Location',
    },
    room: {
        icon:   'meeting_room',
        colour: 'green-7',
        label:  'Room',
    },
    crate: {
        icon:   'inventory_2',
        colour: 'amber-8',
        label:  'Crate',
    },
    person: {
        icon:   'person',
        colour: 'purple-7',
        label:  'Person',
    },
    vehicle: {
        icon:   'directions_car',
        colour: 'red-7',
        label:  'Vehicle',
    },
}

export const crateTypeFallback = {
    icon:   'folder',
    colour: 'grey-7',
    label:  'Other',
}

export function iconForType ( type ) {
    return crateTypeData[ type ] || crateTypeFallback
}

// Derived options for q-select / SelectInput. Stable order = object insertion order.
export const crateTypeOptions = Object.entries( crateTypeData ).map( ( [ value, meta ] ) => ( {
    label: meta.label,
    value,
} ) )
