// Cross-cutting visual defaults for the input family (q-input, q-select).
// One change here reshapes every wrapped input across the app — that's the point.
// Keep this set small: only props that should be uniform across the whole app.
// Component-specific behaviour (e.g. q-select's emit-value/map-options) lives
// in the wrapper component itself, not here.
export const inputDefault = {
    outlined: true,
}
