import type { Namespace } from '@admin-panel/i18n'
import { createApi, type IResponse } from '@admin-panel/lib'

const { fetchData } = createApi('i18n')

export const fetchNamespaces = async (): Promise<IResponse<Namespace[]>> => {
	return fetchData<Namespace[]>('/namespaces', {
		method: 'GET',
	})
}

export const createNamespace = async (data: Partial<Namespace>): Promise<IResponse<Namespace>> => {
	return fetchData<Namespace>('/namespaces', {
		method: 'POST',
		body: data as any,
	})
}

export const updateNamespace = async (id: string, data: Partial<Namespace>): Promise<IResponse<Namespace>> => {
	return fetchData<Namespace>(`/namespaces/${id}`, {
		method: 'PATCH',
		body: data as any,
	})
}

export const deleteNamespace = async (id: string): Promise<IResponse<void>> => {
	return fetchData<void>(`/namespaces/${id}`, {
		method: 'DELETE',
	})
}
