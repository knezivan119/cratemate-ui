const ICON_MAP = {
    location: { icon: 'home',            color: 'blue-7' },
    room:     { icon: 'meeting_room',    color: 'green-7' },
    crate:    { icon: 'inventory_2',     color: 'amber-8' },
    person:   { icon: 'person',          color: 'purple-7' },
    vehicle:  { icon: 'directions_car',  color: 'red-7' },
}

const FALLBACK = { icon: 'folder', color: 'grey-7' }

export function iconForType ( type ) {
    return ICON_MAP[ type ] || FALLBACK
}
