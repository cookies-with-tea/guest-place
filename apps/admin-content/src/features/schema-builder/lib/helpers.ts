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
