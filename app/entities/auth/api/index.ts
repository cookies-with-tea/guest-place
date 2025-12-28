import type { IResponse } from '#shared/interfaces'
import type { IAuthRefreshResponse, IAuthRefreshUpdateRequest, IAuthRegisterRequest } from '../model'

const register = async ({ email }: IAuthRegisterRequest) => {
  return await useFetch('/api/v1/auth/register', {
    method: 'post',
    body: {
      email,
    },
  })
}

export const refresh = (data: IAuthRefreshUpdateRequest) => {
  return useFetch<IResponse<IAuthRefreshResponse>>('/api/v1/auth/refresh', {
    method: 'POST',
    body: {
      refresh_token: data.refreshToken,
    },
  })
}

export const authApi = {
  register,
  refresh,
}
