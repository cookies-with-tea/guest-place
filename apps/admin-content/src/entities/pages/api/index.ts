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

export interface PageItem {
	id: string
	title: string
	slug: string
	blocks: PageBlock[]
	status: 'draft' | 'review' | 'published' | string
	seo?: Record<string, any>
	published_at?: string
	published_by?: string
	created_at?: string
	updated_at?: string
}

const { fetchData: fetchPages } = createApi('pages')
const { fetchData: fetchBlockTypes } = createApi('block-types')

export const pagesApi = {
	getPages: (params?: { status?: string }) => {
		const query = params?.status ? `?status=${params.status}` : ''
		return fetchPages<PageItem[]>(query)
	},

	getPageById: (id: string, params?: { preview?: boolean }) => {
		const query = params?.preview ? `?preview=true` : ''
		return fetchPages<PageItem>(`/${id}${query}`)
	},

	getPageBySlug: (slug: string, params?: { preview?: boolean }) => {
		const query = params?.preview ? `?preview=true` : ''
		return fetchPages<PageItem>(`/${slug}${query}`)
	},

	createPage: (payload: { title: string; slug: string; blocks?: any[]; status?: string; seo?: any; published_at?: string; published_by?: string }) =>
		fetchPages<PageItem>('', {
			method: 'POST',
			body: payload,
		}),

	updatePage: (id: string, payload: { title?: string; slug?: string; blocks?: any[]; status?: string; seo?: any; published_at?: string; published_by?: string }) =>
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
