import { Outlet } from 'react-router-dom'

export function ProtectedRoute() {
  // Login kontrolu gecici olarak devre disi.
  // const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  // const location = useLocation()
  //
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />
  // }

  return <Outlet />
}
