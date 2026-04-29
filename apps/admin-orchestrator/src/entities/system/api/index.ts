import { createApi } from '@admin-panel/lib'

import type { SystemStats } from '../model'

const { fetchData } = createApi('system')

export const systemApi = {
	getStats: () => fetchData<SystemStats>('/stats'),
}
