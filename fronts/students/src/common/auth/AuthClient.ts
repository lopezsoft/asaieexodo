import { AuthController as Auth } from '../controllers/AuthController'
import LoginContract from '../contracts/AuthContract'
import axios, { AxiosResponse } from 'axios'
import { JsonResponse } from '../contracts/JsonResponseContract'
import { AvrApiServerUrl } from '../core/Settings'

export const axiosInstance = axios.create({
  baseURL: `${AvrApiServerUrl}`,
  withCredentials: false
})

export class AuthClient {
  private static apiUrl = process.env.NEXT_PUBLIC_API_URL

  public static async login(data: Record<string, any>) {
    const baseUrl = `${AuthClient.apiUrl}/auth/login` ///auth/login
    const response: AxiosResponse<JsonResponse> = await axios.post(baseUrl, data)
    const dataU = response.data as unknown as LoginContract
    if (response.data.success) {
      Auth.saveAuthData(dataU)
    }


    return response
  }



  public static async reset(params: {}, token: string) {
    const baseUrl = `${AuthClient.apiUrl}/forgot-password/${token}`
    const response = await axios.post(baseUrl, params)

    return response
  }

  public static async logout() {
    const response = await axios.get(`${AuthClient.apiUrl}/auth/logout`)
    if (response.data.success === true) {
      Auth.clearAuthData()
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }

    return response
  }

  // public static async email(data: Record<string, any>) {
  //   return await Http.post('/auth/password/email', data)
  // }

  // public static async userInfo() {
  //   return await Http.get('/auth/user')
  // }
}
