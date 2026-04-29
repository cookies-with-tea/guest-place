export interface ISidebarItem {
	title: string
	path?: string
	icon?: string
	children?: ISidebarItem[]
	meta?: {
		hideInSidebar?: boolean
		[key: string]: any
	}
}

export type SidebarContext = 'system' | 'website'
