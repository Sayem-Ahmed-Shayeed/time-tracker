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
    <div className="flex min-h-[55vh] items-center justify-center" role="status" aria-label="Loading page">
      <div className="flex items-center gap-3 rounded-xl border border-line-soft bg-panel/70 px-4 py-3 shadow-panel backdrop-blur">
        <span className="relative h-2 w-2 rounded-full bg-hazard before:absolute before:inset-[-5px] before:animate-ping before:rounded-full before:border before:border-hazard/30" aria-hidden />
        <span className="font-mono text-[10px] font-semibold tracking-[0.24em] text-muted">LOADING VIEW</span>
      </div>
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
