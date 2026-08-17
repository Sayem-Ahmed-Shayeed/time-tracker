import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isLogin = mode === 'login'
  const from = (location.state as { from?: { pathname: string } } | null)?.from
    ?.pathname ?? '/'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.replace('Firebase: ', '')
          : 'Something went wrong'
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(104,224,207,.08),transparent_28rem),radial-gradient(circle_at_20%_85%,rgba(246,184,74,.07),transparent_30rem)]" aria-hidden />
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <section className="reveal hidden lg:block" aria-label="Product introduction">
          <div className="mb-12 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-panel-2 shadow-panel">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-hazard" fill="none" aria-hidden>
                <path d="M12 5v7l4.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
              </svg>
            </span>
            <div>
              <p className="font-bold tracking-[-0.03em]">Tempo</p>
              <p className="font-mono text-[9px] tracking-[0.22em] text-muted-2">TIME SYSTEM</p>
            </div>
          </div>

          <p className="eyebrow">Focus infrastructure</p>
          <h1 className="mt-4 max-w-xl font-display text-[clamp(3.3rem,6vw,5.8rem)] font-[720] leading-[0.9] tracking-[-0.075em] text-paper">
            Make time<br />visible.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted">
            A quiet workspace for tracking projects, understanding momentum, and turning every hour into a clearer signal.
          </p>

          <div className="mt-10 flex items-center gap-6 border-t border-white/[0.07] pt-5 text-xs text-muted">
            <span className="flex items-center gap-2"><span className="status-dot" aria-hidden /> Live sync</span>
            <span>Focused analytics</span>
            <span>Minimal overhead</span>
          </div>

          <div className="auth-orbit absolute right-[5%] top-[14%] -z-10 opacity-70" aria-hidden>
            <div className="auth-orb-core" />
          </div>
        </section>

        <section className="reveal reveal-delay-1 mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-panel-2 shadow-panel">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-hazard" fill="none" aria-hidden>
                <path d="M12 5v7l4.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
              </svg>
            </span>
            <div>
              <p className="font-bold tracking-[-0.03em]">Tempo</p>
              <p className="font-mono text-[9px] tracking-[0.22em] text-muted-2">TIME SYSTEM</p>
            </div>
          </div>

          <div className="surface-elevated p-6 sm:p-8">
            <p className="eyebrow">{isLogin ? 'Welcome back' : 'Create workspace'}</p>
            <h2 className="mt-2 font-display text-3xl font-[700] tracking-[-0.05em]">
              {isLogin ? 'Sign in to Tempo' : 'Start tracking clearly'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {isLogin
                ? 'Access your projects, live timer, and reports.'
                : 'Create your account and set up your first project in seconds.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-muted">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full px-3.5 py-2.5"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-muted">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full px-3.5 py-2.5"
                  placeholder={isLogin ? 'Enter your password' : 'Minimum 6 characters'}
                />
              </div>

              {error && (
                <div role="alert" className="flex gap-2 rounded-xl border border-alert/30 bg-alert/[0.07] px-3.5 py-3 text-sm text-alert">
                  <span aria-hidden>!</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary w-full py-2.5 disabled:opacity-50"
              >
                {busy ? (
                  <><span className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-r-transparent" aria-hidden /> Working…</>
                ) : isLogin ? (
                  <>Sign in <span aria-hidden>→</span></>
                ) : (
                  <>Create account <span aria-hidden>→</span></>
                )}
              </button>
            </form>

            <p className="mt-6 border-t border-white/[0.06] pt-5 text-sm text-muted">
              {isLogin ? (
                <>New to Tempo?{' '}
                  <Link to="/signup" className="font-semibold text-paper underline decoration-white/20 underline-offset-4 transition hover:decoration-hazard">
                    Create an account
                  </Link>
                </>
              ) : (
                <>Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-paper underline decoration-white/20 underline-offset-4 transition hover:decoration-hazard">
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </div>
          <p className="mt-4 text-center font-mono text-[9px] tracking-[0.16em] text-muted-2">
            PRIVATE WORKSPACE · FIREBASE SECURED
          </p>
        </section>
      </div>
    </main>
  )
}
