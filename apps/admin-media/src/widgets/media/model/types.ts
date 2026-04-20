export interface MediaManagementWidgetProps<T> {
	title?: string
	mediaItems: T[]
	loading?: boolean
	showSelection?: boolean
	showActions?: boolean
	showAddButton?: boolean
	showDeleteButton?: boolean
	showSearch?: boolean
	searchPlaceholder?: string
	paginatorEnabled?: boolean
	rowsPerPage?: number
	rowsPerPageOptions?: number[]
}
