import { fetchData } from '#shared/api'

export const getAll = () => {
  return fetchData('/api/v1/user', {
    method: 'GET',
  })
}

export const userApi = {
  getAll,
}
