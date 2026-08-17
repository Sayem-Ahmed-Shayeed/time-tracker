import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AuthPage({
  mode,
}: {
  mode: 'login' | 'signup'
}) {
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
        err instanceof Error ? err.message.replace('Firebase: ', '') : 'Something went wrong'
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="panel panel-ticks p-8">
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted">
            TIME TRACKER / {isLogin ? 'ACCESS' : 'REGISTER'}
          </p>
          <h1 className="font-display text-2xl uppercase tracking-tight">
            {isLogin ? 'Sign in' : 'Create account'}
          </h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-semibold tracking-wider text-muted">
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1 w-full px-3 py-2"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold tracking-wider text-muted">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1 w-full px-3 py-2"
                placeholder={isLogin ? '••••••••' : 'Min 6 characters'}
              />
            </div>

            {error && (
              <p role="alert" className="border border-alert/50 bg-alert/10 px-3 py-2 text-sm text-alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full py-2.5 uppercase disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Working...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">
            {isLogin ? (
              <>No account?{' '}
                <Link to="/signup" className="text-teal underline decoration-teal/40 hover:decoration-teal">
                  Register
                </Link>
              </>
            ) : (
              <>Already registered?{' '}
                <Link to="/login" className="text-teal underline decoration-teal/40 hover:decoration-teal">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
