import { fetchData } from '~/shared/lib/utils/fetch'

export const getAll = () => {
  return fetchData('/api/v1/user', {
    method: 'GET',
  })
}

export const userApi = {
  getAll,
}
