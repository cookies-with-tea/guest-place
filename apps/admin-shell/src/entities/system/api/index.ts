import { createApi, type IResponse } from '@admin-panel/lib'

import type { SearchResponse } from '../model'

const { fetchData } = createApi('system')

export const systemApi = {
	search: (query: string): Promise<IResponse<SearchResponse>> =>
		fetchData<SearchResponse>('/search', { params: { q: query } }),
}
