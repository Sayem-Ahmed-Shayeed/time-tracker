import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/times', label: 'Times' },
  { to: '/reports', label: 'Reports' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-block h-4 w-4 bg-hazard" aria-hidden />
            <span className="font-display text-lg uppercase tracking-tight">
              Time<span className="text-hazard">/</span>Tracker
            </span>
          </div>
          <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `nav-link px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted ${
                    isActive ? 'nav-link-active' : ''
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs text-muted sm:inline">
              {user?.email}
            </span>
            <button
              onClick={() => void handleSignOut()}
              className="btn btn-ghost px-3 py-1 text-xs uppercase"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
