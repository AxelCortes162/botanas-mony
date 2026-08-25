// src/components/AdminModal/LoginForm.jsx
import { useState } from 'react'
import Button from '../ui/Button'
import { cn } from '../../lib/format'

const LoginForm = ({ onSignIn }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')

    const result = await onSignIn(email, password)
    setBusy(false)

    if (!result.ok) setError(result.error)
  }

  return (
    <form onSubmit={submit} className="py-6 text-center">
      <span className="block text-5xl">🔐</span>
      <h3 className="mt-3 font-display text-xl font-extrabold text-ink">Acceso de administración</h3>
      <p className="mt-1 text-sm text-ink-soft">Inicia sesión con la cuenta del negocio</p>

      <div className="mt-5 space-y-3 text-left">
        <div>
          <label
            htmlFor="admin-email"
            className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ink-faint"
          >
            Correo
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm font-semibold text-ink focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ink-faint"
          >
            Contraseña
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm font-semibold text-ink focus:border-brand-400 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p
          className={cn(
            'mt-3 rounded-xl bg-chili-500/10 px-3 py-2 text-sm font-bold text-chili-600',
          )}
        >
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" full className="mt-5" disabled={busy}>
        {busy ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}

export default LoginForm
