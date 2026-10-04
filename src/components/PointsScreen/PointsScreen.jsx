// src/components/PointsScreen/PointsScreen.jsx
//
// "Mis puntos" dentro de la app (#puntos). Los avisos de tocaaqui abren aquí,
// así el cliente tiene una sola app de Botanas Mony y no dos.
import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { cn } from '../../lib/format'
import { normalizePhone } from '../../lib/whatsapp'
import {
  api,
  currentCode,
  currentSubscription,
  currentWindow,
  enablePush,
  forgetAccount,
  getToken,
  isIosBrowser,
  loadAccount,
  loadInfo,
  register,
  supportsPush,
  windowLeft,
} from '../../lib/puntos'

const inputClass =
  'w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm font-semibold text-ink placeholder:font-medium placeholder:text-ink-faint focus:border-brand-400 focus:outline-none'

const labelClass = 'mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ink-faint'

const Card = ({ title, className, children }) => (
  <section className={cn('rounded-2xl border-2 border-line bg-white p-4', className)}>
    {title && <h3 className={labelClass}>{title}</h3>}
    {children}
  </section>
)

const shortDate = (iso) =>
  new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

// A diferencia de money(), conserva los centavos: "Compra de $129.90"
const pesos = (amount) =>
  `$${Number(amount).toLocaleString('es-MX', {
    minimumFractionDigits: amount % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`

const HISTORY_LABEL = {
  ganados: (entry) => `Compra de ${pesos(entry.monto)}`,
  canjeados: (entry) => (entry.premio ? `Premio: ${entry.premio}` : 'Premio canjeado'),
  reinicio: () => 'Reinicio del 1 de enero',
}

const IosSteps = ({ intro }) => (
  <>
    <p className="text-sm font-semibold text-ink-soft">{intro}</p>
    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-semibold text-ink-soft">
      <li>
        Toca <b>Compartir</b> (el cuadro con la flecha hacia arriba).
      </li>
      <li>
        Elige <b>Agregar a inicio</b>.
      </li>
      <li>
        Abre la app desde tu pantalla de inicio y entra a <b>Mis puntos</b>.
      </li>
    </ol>
  </>
)

/* ------------------------------- Registro -------------------------------- */

const RegisterForm = ({ onRegistered }) => {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    const validPhone = normalizePhone(phone)
    if (!validPhone) {
      setError('Escribe tu celular a 10 dígitos')
      return
    }
    setBusy(true)
    setError('')
    try {
      onRegistered(await register(validPhone, name.trim()))
    } catch (failure) {
      // Si es 400, el mensaje ya dice que pidan en el negocio liberar su teléfono
      setError(failure.message)
      setBusy(false)
    }
  }

  return (
    <Card>
      <h3 className="font-display text-lg font-extrabold text-ink">Empieza a juntar puntos</h3>
      <p className="mt-1 text-sm font-semibold text-ink-soft">
        Por cada $10 de compra ganas 1 punto. Júntalos y cámbialos por productos gratis.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="points-phone" className={labelClass}>
            Tu celular (10 dígitos)
          </label>
          <input
            id="points-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="55 1234 5678"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="points-name" className={labelClass}>
            Tu nombre (opcional)
          </label>
          <input
            id="points-name"
            autoComplete="given-name"
            maxLength={60}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
        </div>
        {error && (
          <p role="alert" className="text-xs font-bold text-chili-600">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" full disabled={busy}>
          {busy ? 'Un momento…' : 'Ver mis puntos'}
        </Button>
      </form>
    </Card>
  )
}

/* -------------------------------- Código --------------------------------- */

const CodeCard = ({ token }) => {
  const [code, setCode] = useState('····')
  const [left, setLeft] = useState(windowLeft)

  useEffect(() => {
    let shownWindow = null
    const tick = () => {
      setLeft(windowLeft())
      const now = currentWindow()
      if (now === shownWindow) return
      shownWindow = now
      currentCode(token).then(setCode)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [token])

  return (
    <Card title="Código para canjear" className="text-center">
      <p
        aria-live="polite"
        className="font-display text-5xl font-extrabold tracking-[0.3em] text-ink tabular-nums"
      >
        {code}
      </p>
      <div className="mx-auto mt-3 h-1.5 max-w-48 overflow-hidden rounded-full bg-cream-deep">
        <div
          className="h-full origin-left rounded-full bg-brand-500"
          style={{ transform: `scaleX(${left})` }}
        />
      </div>
      <p className="mt-3 text-xs font-semibold text-ink-soft">
        En tus pedidos por esta app el código se manda solo. Si pides en el puesto, dalo con tu
        pedido. Cada código sirve 12 horas.
      </p>
    </Card>
  )
}

/* -------------------------------- Avisos --------------------------------- */

const PushCard = ({ token, info }) => {
  // 'ios' | 'denied' | 'off' | 'on' | null (no se puede: no se muestra)
  const [state, setState] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      if (isIosBrowser()) return 'ios'
      if (!supportsPush(info)) return null
      if (Notification.permission === 'denied') return 'denied'
      if (Notification.permission !== 'granted') return 'off'

      let subscription = await currentSubscription()
      if (subscription) {
        // Se vuelve a mandar en silencio: si la caja liberó el teléfono o la
        // base la borró, los avisos vuelven a llegar sin que haga nada.
        api('suscribir', { token, suscripcion: subscription.toJSON() }).catch(() => {})
      } else {
        // Ya había dado permiso antes: se suscribe solo
        subscription = await enablePush(token, info).catch(() => null)
      }
      return subscription ? 'on' : 'off'
    }
    check()
      .catch(() => 'off')
      .then((next) => !cancelled && setState(next))
    return () => {
      cancelled = true
    }
  }, [token, info])

  const activate = async () => {
    setBusy(true)
    setMessage('')
    try {
      await enablePush(token, info)
      setState('on')
    } catch (failure) {
      setMessage(failure.message)
      if (Notification.permission === 'denied') setState('denied')
    } finally {
      setBusy(false)
    }
  }

  const test = async () => {
    setBusy(true)
    setMessage('Mandando…')
    try {
      const result = await api('probar', { token })
      if (result.enviados) {
        const browser = /SamsungBrowser/.test(navigator.userAgent) ? 'Samsung Internet' : 'Chrome'
        setMessage(
          `Enviado. Si en unos segundos no aparece, revisa que las notificaciones de ${browser} estén permitidas en los ajustes del celular.`,
        )
      } else if (result.errores?.length) {
        const [first] = result.errores
        setMessage(`No se pudo mandar: ${first.codigo || ''} ${first.mensaje}`)
      } else {
        setMessage('Este celular ya no está suscrito. Vuelve a activar los avisos.')
        setState('off')
      }
    } catch (failure) {
      setMessage(failure.message)
    } finally {
      setBusy(false)
    }
  }

  if (!state) return null

  return (
    <Card title="Avisos">
      {state === 'ios' && (
        <IosSteps intro="Para recibir avisos en iPhone, instala esta página como app:" />
      )}
      {state === 'denied' && (
        <p className="text-sm font-semibold text-ink-soft">
          Bloqueaste los avisos. Para recibirlos, permítelos en los ajustes del navegador.
        </p>
      )}
      {state === 'off' && (
        <>
          <p className="mb-3 text-sm font-semibold text-ink-soft">
            Entérate de ofertas y de cuándo vencen tus puntos.
          </p>
          <Button full onClick={activate} disabled={busy}>
            🔔 Activar avisos
          </Button>
        </>
      )}
      {state === 'on' && (
        <>
          <p className="mb-3 text-sm font-extrabold text-lima-600">✓ Avisos activados</p>
          <Button variant="secondary" full onClick={test} disabled={busy}>
            Mandarme un aviso de prueba
          </Button>
        </>
      )}
      {message && (
        <p role="status" className="mt-2 text-xs font-semibold text-ink-soft">
          {message}
        </p>
      )}
    </Card>
  )
}

/* -------------------------------- Cuenta --------------------------------- */

const Account = ({ token, info, account, onLogout }) => {
  const { saldo, historial } = account
  const rewards = info.premios ?? []
  // Vienen de menor a mayor
  const best = rewards.filter((reward) => reward.puntos <= saldo).at(-1)
  const next = rewards.find((reward) => reward.puntos > saldo)

  const logout = () => {
    const ok = window.confirm(
      '¿Salir? Para volver a entrar con este teléfono tendrás que pedirle a Mony que lo libere.',
    )
    if (ok) onLogout()
  }

  return (
    <div className="space-y-3">
      <Card className="text-center">
        <h3 className={labelClass}>Tus puntos</h3>
        <p className="font-display text-6xl font-extrabold text-brand-700 tabular-nums">
          {saldo.toLocaleString('es-MX')}
          <span className="ml-1 text-lg text-ink-faint">pts</span>
        </p>
        {(best || next) && (
          <p className="mt-2 text-sm font-extrabold text-ink">
            {best
              ? `¡Ya te alcanza para ${best.nombre}! Pídelo en tu próximo pedido.`
              : `Te faltan ${next.puntos - saldo} para ${next.nombre}.`}
          </p>
        )}
      </Card>

      {rewards.length > 0 && (
        <Card title="Premios">
          <ul className="space-y-3">
            {rewards.map((reward) => {
              const reached = reward.puntos <= saldo
              return (
                <li key={reward.id}>
                  <div className="flex justify-between text-sm font-semibold text-ink">
                    <span>{reward.nombre}</span>
                    <b>{reward.puntos} pts</b>
                  </div>
                  {reached ? (
                    <p className="text-xs font-extrabold text-lima-600">✓ Ya te alcanza</p>
                  ) : (
                    <>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cream-deep">
                        <div
                          className="h-full rounded-full bg-brand-400"
                          style={{ width: `${(saldo / reward.puntos) * 100}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-[11px] font-semibold text-ink-faint">
                        Te faltan {reward.puntos - saldo}
                      </p>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <CodeCard token={token} />
      <PushCard token={token} info={info} />

      <Card title="Historial">
        {historial.length === 0 ? (
          <p className="text-sm font-semibold text-ink-faint">Aún no tienes movimientos.</p>
        ) : (
          <ul className="divide-y divide-line">
            {historial.map((entry, index) => (
              <li key={index} className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-ink">
                  {HISTORY_LABEL[entry.tipo]?.(entry) ?? entry.tipo}
                  <small className="block text-[11px] text-ink-faint">{shortDate(entry.en)}</small>
                </span>
                <b className={cn('text-sm', entry.puntos > 0 ? 'text-lima-600' : 'text-ink-soft')}>
                  {entry.puntos > 0 ? '+' : '−'}
                  {Math.abs(entry.puntos)}
                </b>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="text-center text-[11px] font-semibold text-ink-faint">
        1 punto por cada $10 · Cámbialos por productos · Se reinician cada 1 de enero
      </p>
      <Button variant="ghost" full onClick={logout}>
        Este no es mi teléfono
      </Button>
    </div>
  )
}

/* -------------------------------- Pantalla -------------------------------- */

const PointsScreen = ({ onClose }) => {
  const [token, setToken] = useState(getToken)
  const [info, setInfo] = useState(null)
  const [account, setAccount] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadInfo()
      .then(setInfo)
      .catch((failure) => setError(failure.message))
  }, [])

  useEffect(() => {
    if (!token) return undefined
    let cancelled = false
    loadAccount(token)
      .then((data) => !cancelled && setAccount(data))
      .catch((failure) => {
        if (cancelled) return
        // 401: loadAccount ya borró el token, se vuelve a pedir el teléfono
        if (failure.status === 401) setToken('')
        setError(failure.message)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const logout = () => {
    forgetAccount()
    setAccount(null)
    setToken('')
  }

  let content
  if (!token && isIosBrowser()) {
    content = (
      <Card>
        <IosSteps intro="Para juntar puntos en iPhone, primero instala la app de Botanas Mony y regístrate desde ahí:" />
      </Card>
    )
  } else if (!token) {
    content = (
      <RegisterForm
        onRegistered={(next) => {
          setError('')
          setToken(next)
        }}
      />
    )
  } else if (info && account) {
    content = <Account token={token} info={info} account={account} onLogout={logout} />
  } else if (!error) {
    content = <p className="py-10 text-center text-sm font-semibold text-ink-soft">Cargando tus puntos…</p>
  }

  return (
    <Modal title="Mis puntos" icon="🎁" size="md" onClose={onClose}>
      {content}
      {error && (
        <p role="alert" className="mt-3 text-center text-xs font-bold text-chili-600">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default PointsScreen
