export interface IAuthRegisterRequest {
  email: string
}

export interface IAuthRefreshUpdateRequest {
  refreshToken: string
}

export interface IAuthRefreshResponse {
  accessExpiresIn: number
  accessToken: string
  refreshExpiresIn: number
  refreshToken: string
}
