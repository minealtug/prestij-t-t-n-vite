import { Navigate } from 'react-router-dom'

export function GuestRoute() {
  // Login ekrani gecici olarak devre disi.
  // const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  //
  // if (isAuthenticated) {
  //   return <Navigate to="/" replace />
  // }
  return <Navigate to="/" replace />

  // return <Outlet />
}
