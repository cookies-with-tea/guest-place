export interface IAuthRegisterRequest {
  email: string
}

export interface IAuthRefreshUpdateRequest {
  refreshToken: string
}

export interface IAuthRefreshResponse {
  access_expires_in: number
  access_token: string
  refresh_expires_in: number
  refresh_token: string
}
