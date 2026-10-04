// src/components/DeliveryModal/DeliveryModal.jsx
import { useEffect, useMemo, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { generateTimeSlots } from '../../lib/schedule'
import { cn, money, prettyTime } from '../../lib/format'
import { normalizePhone, POINTS_URL } from '../../lib/whatsapp'

const REWARDS_URL = 'https://tocaaqui.app/api/puntos?premios=mony'

const newOrderId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 8)

const DeliveryModal = ({ config, subtotal, now, onClose, onConfirm }) => {
  // `now` viene del reloj del contexto: así las horas ya pasadas desaparecen
  // aunque el cliente deje el modal abierto un buen rato.
  const slots = useMemo(() => generateTimeSlots(config, now), [config, now])

  const methods = useMemo(
    () =>
      [
        {
          key: 'pickup',
          enabled: config.pickupEnabled,
          icon: '🏪',
          title: 'Recoger en el puesto',
          description: 'Sin costo extra',
          extra: `📍 ${config.address}`,
        },
        {
          key: 'delivery',
          enabled: config.deliveryEnabled,
          icon: '🛵',
          title: 'Envío a domicilio',
          description: `+${money(config.deliveryCost)} de envío`,
        },
      ].filter((option) => option.enabled),
    [config],
  )

  // Arranca siempre en un método que exista de verdad: si solo hay envío, no
  // tiene sentido preseleccionar "recoger" (ni cobrar envío por un método
  // que la pantalla no muestra).
  const [method, setMethod] = useState(() => methods[0]?.key ?? 'pickup')
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [time, setTime] = useState('asap')
  const [showRewards, setShowRewards] = useState(false)
  const [rewards, setRewards] = useState([])
  const [rewardId, setRewardId] = useState('')
  const [rewardCode, setRewardCode] = useState('')
  const [errors, setErrors] = useState({})

  // Los premios los maneja Mony desde su caja en tocaaqui. Si no contestan,
  // la sección no aparece y el pedido sigue igual que siempre.
  useEffect(() => {
    const controller = new AbortController()
    fetch(REWARDS_URL, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setRewards(Array.isArray(data?.premios) ? data.premios : []))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  // El modal sigue abierto mientras el cliente escribe: si el admin desactiva
  // el método elegido en ese rato, hay que cambiarlo o se cobraría un envío
  // que la pantalla ya no ofrece.
  useEffect(() => {
    if (methods.length > 0 && !methods.some((option) => option.key === method)) {
      setMethod(methods[0].key)
    }
  }, [methods, method])

  // Solo cuenta el método si sigue ofreciéndose: si el admin lo desactiva con
  // el modal abierto, no se puede seguir cobrando un envío que ya no existe.
  const activeMethod = methods.some((option) => option.key === method) ? method : null
  const deliveryCost = activeMethod === 'delivery' ? Number(config.deliveryCost) || 0 : 0
  // El premio es un producto extra gratis: no cambia lo que se paga
  const finalTotal = subtotal + deliveryCost

  // El premio solo cuenta con un celular válido. Si le alcanzan los puntos y
  // si el código es bueno solo lo sabe tocaaqui, cuando Mony confirma.
  const validPhone = normalizePhone(phone)
  const reward = validPhone ? rewards.find((option) => String(option.id) === rewardId) : undefined

  const handleConfirm = () => {
    const nextErrors = {}
    if (!customerName.trim()) nextErrors.customerName = 'Necesitamos tu nombre'
    if (activeMethod === 'delivery' && !address.trim()) nextErrors.address = 'Escribe la dirección'
    if (phone.trim() && !validPhone) nextErrors.phone = 'Escribe tu celular a 10 dígitos'
    if (reward && !/^\d{4}$/.test(rewardCode)) {
      nextErrors.rewardCode = 'Para tu premio, escribe tu código de 4 dígitos'
      setShowRewards(true)
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onConfirm({
      method: activeMethod ?? 'pickup',
      customerName: customerName.trim(),
      phone: validPhone,
      address: activeMethod === 'delivery' ? address.trim() : config.address,
      time,
      deliveryCost,
      reward: reward ?? null,
      rewardCode: reward ? rewardCode : '',
      orderId: newOrderId(),
      finalTotal,
    })
  }

  return (
    <Modal
      title="Datos de entrega"
      icon="🚚"
      size="md"
      onClose={onClose}
      footer={
        <>
          <div className="mb-3 space-y-1 text-sm font-semibold text-ink-soft">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            {deliveryCost > 0 && (
              <div className="flex justify-between">
                <span>Envío</span>
                <span>+{money(deliveryCost)}</span>
              </div>
            )}
            {reward && (
              <div className="flex justify-between text-lima-600">
                <span>🎁 {reward.nombre}</span>
                <span>Gratis</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-line pt-2">
              <span className="font-display text-base font-extrabold text-ink">Total</span>
              <span className="font-display text-2xl font-extrabold text-brand-700">
                {money(finalTotal)}
              </span>
            </div>
          </div>
          <Button variant="whatsapp" size="lg" full onClick={handleConfirm}>
            💬 Enviar pedido por WhatsApp
          </Button>
        </>
      }
    >
      {/* Método */}
      <section>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink-faint">
          ¿Cómo quieres recibirlo?
        </p>
        {methods.length === 0 && (
          <p className="rounded-2xl bg-brand-50 p-3 text-xs font-semibold text-brand-900">
            Ahorita no hay métodos de entrega configurados. Manda tu pedido y Mony te confirma cómo
            recibirlo.
          </p>
        )}

        <div className="space-y-2">
          {methods.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setMethod(option.key)}
              className={cn(
                'no-tap-highlight flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition active:scale-[0.99]',
                method === option.key
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-line bg-white hover:border-brand-200',
              )}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-sm font-extrabold text-ink">
                  {option.title}
                </span>
                <span className="block text-xs font-semibold text-ink-soft">
                  {option.description}
                </span>
                {option.extra && (
                  <span className="mt-0.5 block text-[11px] text-ink-faint">{option.extra}</span>
                )}
              </span>
              <span
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full border-2 text-xs font-extrabold',
                  method === option.key
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-line text-transparent',
                )}
              >
                ✓
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Datos del cliente */}
      <section className="mt-4 space-y-3">
        <div>
          <label
            htmlFor="customer-name"
            className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ink-faint"
          >
            👤 Tu nombre
          </label>
          <input
            id="customer-name"
            type="text"
            autoComplete="name"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="¿Cómo te llamas?"
            className={cn(
              'w-full rounded-2xl border-2 bg-white px-4 py-3 text-sm font-semibold text-ink placeholder:font-medium placeholder:text-ink-faint focus:outline-none',
              errors.customerName ? 'border-chili-500' : 'border-line focus:border-brand-400',
            )}
          />
          {errors.customerName && (
            <p className="mt-1 text-xs font-bold text-chili-600">{errors.customerName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="customer-phone"
            className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ink-faint"
          >
            📱 Tu celular (para juntar puntos)
          </label>
          <input
            id="customer-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="10 dígitos (opcional)"
            aria-describedby="customer-phone-hint"
            className={cn(
              'w-full rounded-2xl border-2 bg-white px-4 py-3 text-sm font-semibold text-ink placeholder:font-medium placeholder:text-ink-faint focus:outline-none',
              errors.phone ? 'border-chili-500' : 'border-line focus:border-brand-400',
            )}
          />
          {errors.phone ? (
            <p className="mt-1 text-xs font-bold text-chili-600">{errors.phone}</p>
          ) : (
            <p id="customer-phone-hint" className="mt-1 text-[11px] font-semibold text-ink-faint">
              Ganas 1 punto por cada $10 y los cambias por productos gratis.
            </p>
          )}
        </div>

        {/* Premio: plegado, solo se abre con un celular válido, y no aparece
            si tocaaqui no contestó con la lista de premios */}
        {rewards.length > 0 && (
          <div className="rounded-2xl border-2 border-line bg-white">
            <button
              type="button"
              disabled={!validPhone}
              aria-expanded={showRewards && Boolean(validPhone)}
              onClick={() => setShowRewards((open) => !open)}
              className="no-tap-highlight flex w-full items-center justify-between px-4 py-3 text-left text-sm font-extrabold text-ink disabled:text-ink-faint"
            >
              <span>
                🎁 ¿Ya te alcanza para un premio?
                {!validPhone && (
                  <span className="block text-[11px] font-semibold">Primero escribe tu celular</span>
                )}
              </span>
              <span aria-hidden="true">{showRewards && validPhone ? '▲' : '▼'}</span>
            </button>

            {showRewards && validPhone && (
              <div className="space-y-3 border-t border-line px-4 pb-4 pt-3">
                <div>
                  <label
                    htmlFor="reward"
                    className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ink-faint"
                  >
                    Premio
                  </label>
                  <select
                    id="reward"
                    value={rewardId}
                    onChange={(event) => setRewardId(event.target.value)}
                    className="w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm font-semibold text-ink focus:border-brand-400 focus:outline-none"
                  >
                    <option value="">Ninguno por ahora</option>
                    {rewards.map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.nombre} · {option.puntos} puntos
                      </option>
                    ))}
                  </select>
                </div>

                {reward && (
                  <div>
                    <label
                      htmlFor="reward-code"
                      className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ink-faint"
                    >
                      Tu código
                    </label>
                    <input
                      id="reward-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={4}
                      value={rewardCode}
                      onChange={(event) =>
                        setRewardCode(event.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      placeholder="4 dígitos"
                      className={cn(
                        'w-full rounded-2xl border-2 bg-white px-4 py-3 text-sm font-semibold tracking-widest text-ink placeholder:font-medium placeholder:tracking-normal placeholder:text-ink-faint focus:outline-none',
                        errors.rewardCode ? 'border-chili-500' : 'border-line focus:border-brand-400',
                      )}
                    />
                    {errors.rewardCode && (
                      <p className="mt-1 text-xs font-bold text-chili-600">{errors.rewardCode}</p>
                    )}
                  </div>
                )}
                <a
                  href={POINTS_URL}
                  target="_blank"
                  rel="noopener"
                  className="inline-block text-xs font-extrabold text-brand-700 underline"
                >
                  Ver mis puntos y mi código ↗
                </a>
              </div>
            )}
          </div>
        )}

        {activeMethod === 'delivery' && (
          <div>
            <label
              htmlFor="delivery-address"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ink-faint"
            >
              📍 Dirección de entrega
            </label>
            <textarea
              id="delivery-address"
              rows="3"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Calle, número, colonia y referencias…"
              className={cn(
                'w-full resize-none rounded-2xl border-2 bg-white px-4 py-3 text-sm font-semibold text-ink placeholder:font-medium placeholder:text-ink-faint focus:outline-none',
                errors.address ? 'border-chili-500' : 'border-line focus:border-brand-400',
              )}
            />
            {errors.address && (
              <p className="mt-1 text-xs font-bold text-chili-600">{errors.address}</p>
            )}
          </div>
        )}
      </section>

      {/* Horario */}
      <section className="mt-4">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink-faint">
          🕐 ¿Para qué hora?
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTime('asap')}
            className={cn(
              'no-tap-highlight rounded-full border-2 px-4 py-2 text-sm font-extrabold transition active:scale-95',
              time === 'asap'
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line bg-white text-ink-soft hover:border-brand-300',
            )}
          >
            ⚡ Lo antes posible
          </button>

          {slots.map((slot) => (
            <button
              key={slot.value}
              type="button"
              onClick={() => setTime(slot.value)}
              className={cn(
                'no-tap-highlight rounded-full border-2 px-4 py-2 text-sm font-extrabold transition active:scale-95',
                time === slot.value
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-line bg-white text-ink-soft hover:border-brand-300',
              )}
            >
              {prettyTime(slot.value)}
            </button>
          ))}
        </div>

        <p className="mt-2 text-xs font-semibold text-ink-faint">
          {slots.length > 0
            ? `⏱️ Tiempo de preparación aproximado: ${config.preparationTime} min`
            : 'Ya no hay horarios disponibles hoy. Puedes mandar el pedido y Mony te confirma la hora.'}
        </p>
      </section>
    </Modal>
  )
}

export default DeliveryModal
