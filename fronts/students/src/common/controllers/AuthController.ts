import LoginContract, { UserContract } from '../contracts/AuthContract'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export class AuthController {
  static get token(): string {
    return this._token
  }
  static set token(value: string) {
    this._token = value
  }
  static get loginData(): LoginContract {
    return this._loginData
  }
  static set loginData(value: LoginContract) {
    this._loginData = value
  }
  static get user(): UserContract {
    return this._user
  }
  static set user(value: UserContract) {
    this._user = value
  }
  static get instance(): AuthController {
    return this._instance
  }

  static set instance(value: AuthController) {
    this._instance = value
  }

  private static _instance: AuthController
  protected static jwtName = 'AvrJwtApi'
  private static _token: string
  private static _loginData: LoginContract
  private static _user: UserContract

  private static _userUpdatedAction: Function

  // private static _userUpdatedAction: (user: UserContract) => void

  private static createInstance(): AuthController {
    return this._instance || new AuthController()
  }

  public static saveAuthData(data: LoginContract) {
    localStorage.setItem(this.jwtName, JSON.stringify(data))
    this._token = data.access_token
    this._loginData = data
    this._user = data.user
  }

  private static verifyAccessToken() {
    const data = JSON.parse(localStorage.getItem(this.jwtName) ?? 'null') as LoginContract
    if (data && data.expires_at) {
      const dt = new Date()
      const expires_at = parseInt(data?.expires_at)
      if (dt.getTime() > expires_at) {
        this.clearAuthData()
      }
    }
  }

  public static getAccessToken(): string {
    this.verifyAccessToken()

    const dataStr = localStorage.getItem(this.jwtName)
    const data = dataStr ? (JSON.parse(dataStr) as LoginContract) : null

    if (data && !this._token) {
      this.saveAuthData(data)
    }

    return data ? data.access_token : ''
  }


  // public static getAccessTokenForRequest(): string {
  //   return this.getAccessToken();
  // }




  public static getInstance(): AuthController {
    this._instance = AuthController.createInstance()

    return this._instance
  }

  public static updateUserAuthData(userData: UserContract) {
    this._user = { ...this._user, ...userData }
    if (this._loginData) {
      this._loginData.user = this._user
    }

    const jwtData: any = JSON.parse(localStorage.getItem(this.jwtName) ?? 'null')
    if (this._loginData && jwtData) {
      localStorage.setItem(this.jwtName, JSON.stringify(this._loginData))
    }

    if (this._userUpdatedAction) {
      this._userUpdatedAction()
    }
  }

  public static setUserUpdatedAction(callback: Function) {
    this._userUpdatedAction = callback
  }

  // public static setUserUpdatedAction(callback: (user: UserContract) => void) {
  //   this._userUpdatedAction = callback
  // }

  public static isAuthenticated(): boolean {
    return this.getAccessToken().length > 20
  }

  public static clearAuthData(): void {
    localStorage.removeItem(this.jwtName)
    localStorage.removeItem('classMenu')
    this._token = ''
    this._user = {} as UserContract
    this._loginData = {} as LoginContract
  }

  public static redirect() {
    const baseUrl = `${apiUrl}`
    let path = '/'
    if (this.isSupervisor() || this.isAdmin()) {
      path = '/dashboard'
    }
    axios
      .get(`${baseUrl}/${path}`)
      .then(response => {
        window.location.href = response.data
      })
      .catch(error => {
        console.log(error)
      })
  }

  public static hasNotAccessMessage(message = 'Usted no tiene acceso a modulo.') {
    toast.error(message)
  }
  public static isAdmin(): boolean {
    return this.hasAccess('administrator')
  }

  // public static isDirector(): boolean {
  //   return this.hasAccess('Director')
  // }

  public static isSupervisor(): boolean {
    return this.hasAccess('Secretaria(o)')
  }

  public static isAccessSpecialistModule(): boolean {
    return true
  }
  private static hasAccess(role: string): boolean {
    if (!this.isAuthenticated()) {
      window.location.href = `${window.location.origin}/auth/login`
    }

    return this.user?.roles[0]?.name === role
  }
}
