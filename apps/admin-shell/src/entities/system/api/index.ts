import { createApi } from '@admin-panel/lib'

const { fetchData } = createApi('system')

export const systemApi = {
	search: (query: string) => fetchData<any>('/search', { params: { q: query } }),
}
