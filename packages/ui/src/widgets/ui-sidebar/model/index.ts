export interface ISidebarItem {
	title: string
	path?: string
	icon?: string
	/** Module federation `name` МФ — ключ для справки "что это и зачем" (MFE_HELP) */
	mfeName?: string
	children?: ISidebarItem[]
	meta?: {
		hideInSidebar?: boolean
		[key: string]: any
	}
}

export type SidebarContext = 'system' | 'website'
