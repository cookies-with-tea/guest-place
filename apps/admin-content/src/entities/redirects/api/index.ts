import { createApi } from '@admin-panel/lib'

export interface RedirectItem {
	id: string
	source_path: string
	target_path: string
	status_code: number
	is_active: boolean
	hits: number
	created_at: string
	updated_at: string
}

export interface CreateRedirectDTO {
	source_path: string
	target_path: string
	status_code?: number
	is_active?: boolean
}

export interface UpdateRedirectDTO {
	source_path?: string
	target_path?: string
	status_code?: number
	is_active?: boolean
}

export interface CheckRedirectResponse {
	matched: boolean
	target_path?: string
	status_code?: number
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
