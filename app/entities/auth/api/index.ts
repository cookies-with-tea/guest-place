import type { IResponse } from '#shared/interfaces'
import { useFetchData } from '~/shared/lib/composables'
import type { IAuthRefreshResponse, IAuthRefreshUpdateRequest, IAuthRegisterRequest } from '../model'
import { camelToSnake } from '#shared/lib/utils'

const register = async ({ email }: IAuthRegisterRequest) => {
  return await useFetch('/api/v1/auth/register', {
    method: 'post',
    body: {
      email,
    },
  })
}

export const refresh = (data: IAuthRefreshUpdateRequest) => {
  return useFetchData<IResponse<IAuthRefreshResponse>>('/api/v1/auth/refresh', {
    method: 'POST',
    body: camelToSnake(data),
  })
}

export const authApi = {
  register,
  refresh,
}
