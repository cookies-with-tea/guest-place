import { createApi } from '@admin-panel/lib'

export interface RedirectItem {
	id: string
	sourcePath: string
	targetPath: string
	statusCode: number
	isActive: boolean
	hits: number
	createdAt: string
	updatedAt: string
}

export interface CreateRedirectDTO {
	sourcePath: string
	targetPath: string
	statusCode?: number
	isActive?: boolean
}

export interface UpdateRedirectDTO {
	sourcePath?: string
	targetPath?: string
	statusCode?: number
	isActive?: boolean
}

export interface CheckRedirectResponse {
	matched: boolean
	targetPath?: string
	statusCode?: number
}

const { fetchData: fetchRedirects } = createApi('redirects')

export const redirectsApi = {
	getRedirects: () => fetchRedirects<RedirectItem[]>(''),

	checkRedirect: (path: string) => {
		const encoded = encodeURIComponent(path)
		return fetchRedirects<CheckRedirectResponse>(`/check?path=${encoded}`)
	},

	createRedirect: (payload: CreateRedirectDTO) =>
		fetchRedirects<RedirectItem>('', {
			method: 'POST',
			body: payload,
		}),

	updateRedirect: (id: string, payload: UpdateRedirectDTO) =>
		fetchRedirects<RedirectItem>(`/${id}`, {
			method: 'PATCH',
			body: payload,
		}),

	deleteRedirect: (id: string) =>
		fetchRedirects(`/${id}`, {
			method: 'DELETE',
		}),
}
