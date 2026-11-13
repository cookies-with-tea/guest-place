import { createApi } from '@admin-panel/lib'

export interface BlockTypeItem {
	id: string
	name: string
	slug: string
	description?: string
	icon?: string
	schema: any[]
	category?: string
	created_at?: string
	updated_at?: string
}

export interface BlockStyle {
	theme?: 'light' | 'dark' | 'accent' | 'muted' | 'transparent' | string
	padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | string
	margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | string
	backgroundColor?: string
	backgroundGradient?: string
	backgroundImage?: string
	customCss?: string
}

export interface PageBlock {
	id: string
	type: string
	data: Record<string, any>
	style?: BlockStyle
}

export interface BreadcrumbItem {
	id: string
	title: string
	slug: string
}

export interface PageItem {
	id: string
	title: string
	slug: string
	blocks: PageBlock[]
	status: 'draft' | 'review' | 'published' | 'scheduled' | string
	seo?: {
		title?: string
		description?: string
		og_image?: string
		canonical?: string
		no_index?: boolean
		[key: string]: any
	}
	parent_id?: string | null
	published_at?: string
	published_by?: string
	scheduled_at?: string
	created_at?: string
	updated_at?: string
}

const { fetchData: fetchPages } = createApi('pages')
const { fetchData: fetchBlockTypes } = createApi('block-types')

export const pagesApi = {
	// Сервер теперь пагинирует этот список (защита от неограниченного SELECT,
	// см. IMPROVEMENTS.md), но список страниц пока не имеет своего пейджера —
	// запрашиваем максимально допустимый limit (100) и разворачиваем ответ в
	// плоский массив, чтобы текущие потребители продолжали работать как раньше.
	getPages: async (params?: { status?: string; page?: number; limit?: number }) => {
		const query: Record<string, string | number> = { limit: params?.limit ?? 100 }

		if (params?.status) query.status = params.status
		if (params?.page) query.page = params.page

		const res = await fetchPages<{ items: PageItem[]; pagination: unknown }>('', { params: query })

		return { ...res, data: res.data?.items }
	},

	getPageById: (id: string, params?: { preview?: boolean }) => {
		const query = params?.preview ? `?preview=true` : ''
		return fetchPages<PageItem>(`/${id}${query}`)
	},

	getPageBySlug: (slug: string, params?: { preview?: boolean }) => {
		const query = params?.preview ? `?preview=true` : ''
		return fetchPages<PageItem>(`/${slug}${query}`)
	},

	getPageBreadcrumbs: (idOrSlug: string) => fetchPages<BreadcrumbItem[]>(`/${idOrSlug}/breadcrumbs`),

	createPage: (payload: {
		title: string
		slug: string
		blocks?: any[]
		status?: string
		seo?: any
		parent_id?: string | null
		published_at?: string
		published_by?: string
		scheduled_at?: string
	}) =>
		fetchPages<PageItem>('', {
			method: 'POST',
			body: payload,
		}),

	updatePage: (
		id: string,
		payload: {
			title?: string
			slug?: string
			blocks?: any[]
			status?: string
			seo?: any
			parent_id?: string | null
			clear_parent?: boolean
			published_at?: string
			published_by?: string
			scheduled_at?: string
		}
	) =>
		fetchPages<PageItem>(`/${id}`, {
			method: 'PATCH',
			body: payload,
		}),

	deletePage: (id: string) =>
		fetchPages(`/${id}`, {
			method: 'DELETE',
		}),

	getBlockTypes: () => fetchBlockTypes<BlockTypeItem[]>(''),

	createBlockType: (payload: any) =>
		fetchBlockTypes<BlockTypeItem>('', {
			method: 'POST',
			body: payload,
		}),

	updateBlockType: (id: string, payload: any) =>
		fetchBlockTypes<BlockTypeItem>(`/${id}`, {
			method: 'PATCH',
			body: payload,
		}),

	deleteBlockType: (id: string) =>
		fetchBlockTypes(`/${id}`, {
			method: 'DELETE',
		}),

	syncBlockTypes: (blocks: any[]) =>
		fetchBlockTypes<BlockTypeItem[]>('/sync', {
			method: 'POST',
			body: { blocks },
		}),
}
