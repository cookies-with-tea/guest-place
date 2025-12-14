import { USER_MOCK_DATA } from '../mock'
import type { IUser } from '../model'

const getMe = async (): Promise<IUser> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(USER_MOCK_DATA)
    }, 500)
  })
}

export const userApi = {
  getMe,
}
