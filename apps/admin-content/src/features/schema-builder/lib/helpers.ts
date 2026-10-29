export function toSlug(s: string): string {
	return s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
}

let _uid = 0

/** A unique id for a field being edited client-side, stable enough for Vue's :key. */
export function uid(): string {
	return `f_${++_uid}_${Date.now()}`
}

/** Recursively tags a schema's fields (and Repeater/Group sub-fields, any depth) with the
 * builder-only `_id`/`_nameTouched` metadata the canvas needs for :key/selection/dirty-tracking. */
export function addFieldMeta(fields: any[]): any[] {
	return fields.map((f) => ({
		...f,
		_id: uid(),
		_nameTouched: true,
		fields: f.fields ? addFieldMeta(f.fields) : f.fields,
	}))
}

/** Inverse of {@link addFieldMeta} — strips builder-only metadata before a schema is sent to
 * the API, at every nesting depth. */
export function stripFieldMeta(fields: any[]): any[] {
	return fields.map(({ _id: _a, _nameTouched: _b, ...rest }) => ({
		...rest,
		fields: rest.fields ? stripFieldMeta(rest.fields) : rest.fields,
	}))
}
