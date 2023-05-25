import { AuthController as Auth } from '../controllers/AuthController'
import { AvrApiServerUrl/*, gcsUrl*/ } from '../core/Settings'
import axios from 'axios'
import { JsonResponse } from '../contracts/JsonResponseContract'

export const axiosInstance = axios.create({
  baseURL: `${AvrApiServerUrl}`,
  withCredentials: false
})
export class HttpController {
  public static getHeader() {
    const headers: any = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    if (Auth.isAuthenticated()) {
      headers.Authorization = `${Auth.loginData.token_type} ${Auth.token}`
    }

    return headers
  }

  public static getUrlApi() {
    return AvrApiServerUrl
  }

  // public static getGcsUrl() {
  //   return gcsUrl
  // }
  public static get(url: string, params?: {}) {
    return axiosInstance.get<JsonResponse>(url, {
      headers: this.getHeader(),
      params: params
    })
  }

  // Record<string, any>
  //interfaz genérica de TypeScript que define un objeto con claves de tipo string y valores de cualquier tipo (any)

  public static post(url: string, data?: Record<string, any>) {
    return axiosInstance.post<JsonResponse>(url, JSON.stringify(data), {
      headers: this.getHeader()
    })
  }

  public static put(url: string, data: Record<string, any>) {
  return axiosInstance.put<JsonResponse>(url, JSON.stringify(data), {
        headers: this.getHeader()

      })
    }
  public static delete(url: string) {
    return axiosInstance.delete<JsonResponse>(url, {
      headers: this.getHeader()
    })
  }

}

export default axiosInstance
