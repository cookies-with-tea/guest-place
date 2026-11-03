export interface RankedListItem {
	id?: string | number
	label: string
	value: string | number
	/** Fill width of the progress track, 0–100. Omit to render the row without a track. */
	percent?: number
	trend?: number
	/** Rendered as plain text/emoji; use the `icon` slot for a richer visual (flag image, avatar). */
	icon?: string
}
