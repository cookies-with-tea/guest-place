import { createApi } from '@admin-panel/lib'

const { fetchData } = createApi('mfe')

export const mfeApi = {
	getManifest: () => fetchData<any>('/manifest'),
}
