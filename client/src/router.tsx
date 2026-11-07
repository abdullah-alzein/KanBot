import { createBrowserRouter, Navigate } from 'react-router'
import { GuestRoute } from './features/auth/GuestRoute'
import { LoginPage } from './features/auth/LoginPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { RegisterPage } from './features/auth/RegisterPage'
import { BacklogPage } from './features/backlog/BacklogPage'
import { BoardPage } from './features/board/BoardPage'
import { SprintDetailPage } from './features/sprints/SprintDetailPage'
import { SprintsPage } from './features/sprints/SprintsPage'
import { ProjectsPage } from './features/projects/ProjectsPage'
import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { ProjectLayout } from './layouts/ProjectLayout'
import { RootLayout } from './layouts/RootLayout'
import { NotFoundPage } from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/login', element: <LoginPage /> },
              { path: '/register', element: <RegisterPage /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/', element: <Navigate to="/projects" replace /> },
              { path: '/projects', element: <ProjectsPage /> },
              {
                path: '/projects/:projectId',
                element: <ProjectLayout />,
                children: [
                  { index: true, element: <Navigate to="backlog" replace /> },
                  { path: 'backlog', element: <BacklogPage /> },
                  { path: 'board', element: <BoardPage /> },
                  { path: 'sprints', element: <SprintsPage /> },
                  { path: 'sprints/:sprintId', element: <SprintDetailPage /> },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
