// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// import { AuthController } from 'src/common/controllers/AuthController'

// import {  AuthController as Auth } from '../common/controllers/AuthController'

//  import  authConfig from '../configs/auth'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType } from './types'
import { AvrApiServerUrl } from '../common/core/Settings'

export const axiosInstance = axios.create({
  baseURL: `${AvrApiServerUrl}`,
  withCredentials: false
})

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  const storageTokenKeyName= 'AvrJwtApi'

  useEffect(() => {

    const initAuth = async (): Promise<void> => {
      const storedToken = window.localStorage.getItem('AvrJwtApi');

      // const userT = storedToken ? JSON.parse(storedToken).user : null
      // const expired = storedToken ? JSON.parse(storedToken).expires_at : null;
      // const success = storedToken ? JSON.parse(storedToken).success : null;

      if (storedToken) {
        setLoading(true);
        axiosInstance.defaults.headers.common['Authorization'] = storedToken;
        const userT = storedToken ? JSON.parse(storedToken).user : null //->se obtiene usuario autenticado
        headers: {
              Authorization: storedToken
            }
        setLoading(false);
        const role = 'admin';

         setUser({ ...userT,role});
        router.replace('/dashboard');
      }else{
        localStorage.removeItem('userData')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('accessToken')
        setUser(null)
        setLoading(false)
        const expired = storedToken ? JSON.parse(storedToken).expires_at : null;
        const currentDate = new Date();

        if (expired > currentDate) {
          router.replace('/logout');
            } else if (!router.pathname.includes('login')) {
              router.replace('/login')
            }


      }
      setLoading(false)}

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    axios

      // .post(authConfig.loginEndpoint, params)
      .post(`${apiUrl}/auth/login`, params)
      .then(async response => {
        params.rememberMe
          ? window.localStorage.setItem(storageTokenKeyName, response.data.storedToken)
          : null
        const returnUrl = router.query.returnUrl
        setUser({ ...response.data.userData })
        params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(response.data.userData)) : null

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

        router.replace(redirectURL as string)
      })

      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }


  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    const storageTokenKeyName= 'AvrJwtApi'
    window.localStorage.removeItem(storageTokenKeyName)
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
