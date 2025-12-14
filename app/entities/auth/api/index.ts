import type { IAuthRegister } from '../model'
import { useFetchData } from '#shared/lib/composables'

const register = async ({ email }: any) => {
  return await useFetchData('/api/v1/auth/register', {
    method: 'post',
    body: {
      email,
    },
  })
}

export const authApi = {
  register,
}
