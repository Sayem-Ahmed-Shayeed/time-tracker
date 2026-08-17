import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/', label: 'Overview', icon: '⌁' },
  { to: '/projects', label: 'Projects', icon: '◇' },
  { to: '/times', label: 'Time log', icon: '◷' },
  { to: '/reports', label: 'Reports', icon: '⌇' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="app-shell min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/[0.055] bg-ink/80 backdrop-blur-xl supports-[backdrop-filter]:bg-ink/68">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" className="group flex shrink-0 items-center gap-3" aria-label="Time Tracker home">
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-white/10 bg-panel-2 shadow-[0_8px_24px_rgba(0,0,0,0.24)]">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(246,184,74,.24),transparent_46%)]" aria-hidden />
              <svg viewBox="0 0 24 24" className="relative h-4 w-4 text-hazard" fill="none" aria-hidden>
                <path d="M12 5v7l4.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
              </svg>
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-bold tracking-[-0.025em] text-paper">Tempo</p>
              <p className="-mt-0.5 font-mono text-[8px] tracking-[0.2em] text-muted-2">TIME SYSTEM</p>
            </div>
          </NavLink>

          <nav aria-label="Main" className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto flex w-max items-center gap-1 rounded-xl border border-white/[0.055] bg-white/[0.018] p-1">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `nav-link gap-2 px-2.5 py-1.5 text-xs font-semibold sm:px-3 ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <span className="text-[11px] text-muted-2" aria-hidden>{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <span className="status-dot" aria-hidden />
              <span className="max-w-40 truncate text-xs text-muted">{user?.email}</span>
            </div>
            <button
              onClick={() => void handleSignOut()}
              className="btn btn-ghost h-9 min-h-0 px-3 text-xs"
              aria-label="Sign out"
            >
              <span className="hidden sm:inline">Sign out</span>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:hidden" fill="none" aria-hidden>
                <path d="M9 5H5.8A1.8 1.8 0 0 0 4 6.8v10.4A1.8 1.8 0 0 0 5.8 19H9M14 8l4 4-4 4M18 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </main>
    </div>
  )
}
