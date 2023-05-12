export interface Role {
  id: number
  name: string
  description: string
}

export interface UserContract {
  id: number
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string

  roles: Role[]
}

export default interface LoginContract {
  access_token: string
  user: UserContract
  token_type: string
  expires_at: string
  message: string
  success: boolean
}
