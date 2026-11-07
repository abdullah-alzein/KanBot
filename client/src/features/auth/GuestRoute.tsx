import { Navigate, Outlet, useSearchParams } from 'react-router'
import { FullPageLoader } from '../../components/states'
import { safeRedirect } from '../../lib/constants'
import { useAuth } from './useAuth'

export function GuestRoute() {
  const { status } = useAuth()
  const [params] = useSearchParams()
  if (status === 'loading') return <FullPageLoader />
  if (status === 'authed') return <Navigate to={safeRedirect(params.get('redirect'))} replace />
  return <Outlet />
}
