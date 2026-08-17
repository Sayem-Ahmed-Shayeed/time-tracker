import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './components/AppShell'
import { AuthPage } from './pages/AuthPage'

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ProjectsPage = lazy(() =>
  import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
)
const TimesPage = lazy(() =>
  import('./pages/TimesPage').then((m) => ({ default: m.TimesPage })),
)
const ReportsPage = lazy(() =>
  import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })),
)

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="font-mono text-sm tracking-widest text-muted">
        LOADING<span className="animate-pulse">...</span>
      </span>
    </div>
  )
}

function Suspended({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Suspended>
                    <DashboardPage />
                  </Suspended>
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Suspended>
                    <ProjectsPage />
                  </Suspended>
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/times"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Suspended>
                    <TimesPage />
                  </Suspended>
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Suspended>
                    <ReportsPage />
                  </Suspended>
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
