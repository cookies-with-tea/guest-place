import { createApi } from '@admin-panel/lib'

const { fetchData } = createApi('mfe')

export const mfeApi = {
	getAll: () => fetchData<any[]>(''),
	create: (data: any) => fetchData<any>('', { method: 'POST', body: data }),
	update: (id: string, data: any) => fetchData<any>(`/${id}`, { method: 'PUT', body: data }),
	deleteById: (id: string) => fetchData<any>(`/${id}`, { method: 'DELETE' }),
	checkHealth: (url: string, signal?: AbortSignal) =>
		fetch(url, {
			method: 'GET',
			mode: 'no-cors',
			signal,
		}),
}
