import { Outlet } from 'react-router'
import { ToastProvider } from '../components/toast/ToastProvider'
import { AuthProvider } from '../features/auth/AuthProvider'

export function RootLayout() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ToastProvider>
  )
}
