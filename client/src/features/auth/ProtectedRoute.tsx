import { Navigate, Outlet, useLocation } from 'react-router'
import { Button } from '../../components/Button'
import { ErrorState, FullPageLoader } from '../../components/states'
import { useAuth } from './useAuth'

export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader />
  if (status === 'error') {
    return (
      <div className="full-page">
        <ErrorState title="Can't reach Kanbot" message="Cannot reach the server. Is it running?">
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </ErrorState>
      </div>
    )
  }
  if (status === 'guest') {
    const target = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${target}`} replace />
  }
  return <Outlet />
}
