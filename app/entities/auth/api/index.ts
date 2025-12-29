import type { IAuthRefreshResponse, IAuthRefreshUpdateRequest, IAuthRegisterRequest } from '../model'
import { camelToSnake, fetchData } from '#shared/lib/utils'

const register = async ({ email }: IAuthRegisterRequest) => {
  return await fetchData('/api/v1/auth/register', {
    method: 'POST',
    body: {
      email,
    },
  })
}

export const refresh = (data: IAuthRefreshUpdateRequest) => {
  return fetchData<IAuthRefreshResponse>('/api/v1/auth/refresh', {
    method: 'POST',
    body: camelToSnake(data),
  })
}

export const authApi = {
  register,
  refresh,
}
