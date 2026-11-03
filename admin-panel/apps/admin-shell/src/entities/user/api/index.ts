import { createApi } from '@admin-panel/lib'

const { fetchData } = createApi('user')

export const getOne = async (id: string) => {
	return await fetchData(`/${id}`)
}
