import * as React from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { AuthController as Auth } from '../controllers/AuthController'

export const CanActivate = ({ children }: { children: JSX.Element }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const location = useLocation()

  if (!Auth.isAuthenticated()) {
    return <Navigate to='/auth/login' state={{ from: location }} replace />
  }

  return children
}

export const CanActivateAuth = ({ children }: { children: JSX.Element }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const location = useLocation()

  if (Auth.isAuthenticated()) {
    return <Navigate to='/' state={{ from: location }} replace />
  }

  return children
}
