// src/components/AdminModal/DeliveryTab.jsx
import { useState } from 'react'
import Button from '../ui/Button'
import StaleNotice from './StaleNotice'
import { useDraft } from '../../hooks/useDraft'
import { cn } from '../../lib/format'
import { ALL_DAYS, DAY_SHORT, formatDays, parseDays } from '../../lib/schedule'

// De lunes a domingo, que es como se lee un calendario aquí
const WEEK = [1, 2, 3, 4, 5, 6, 0]

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ink-faint">
      {label}
    </span>
    {children}
    {hint && <span className="mt-1 block text-[11px] text-ink-faint">{hint}</span>}
  </label>
)

const inputClass =
  'w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm font-semibold text-ink focus:border-brand-400 focus:outline-none'

/** Fila de días de la semana; sin ningún día marcado, esa opción queda apagada. */
const DaySelector = ({ icon, label, hint, value, onChange }) => {
  // Mismo respaldo que usa resolveStoreState, para que el panel muestre
  // exactamente lo que la app va a aplicar
  const days = parseDays(value, ALL_DAYS)

  const toggle = (day) => {
    const next = days.includes(day) ? days.filter((item) => item !== day) : [...days, day]
    onChange(formatDays(next))
  }

  return (
    <div className="rounded-2xl border-2 border-line bg-white p-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="flex-1 text-sm font-extrabold text-ink">{label}</span>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {WEEK.map((day) => {
          const active = days.includes(day)
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              aria-pressed={active}
              className={cn(
                'no-tap-highlight rounded-xl py-2 text-xs font-extrabold transition active:scale-90',
                active
                  ? 'bg-brand-600 text-white'
                  : 'bg-cream-deep text-ink-faint hover:bg-brand-50',
              )}
            >
              {DAY_SHORT[day]}
            </button>
          )
        })}
      </div>

      <p className="mt-1.5 text-[11px] font-semibold text-ink-faint">
        {days.length === 0 ? '⚠️ Desactivado: no se ofrece ningún día' : hint}
      </p>
    </div>
  )
}

const DeliveryTab = ({ settings, onSave }) => {
  const { draft, update, markSaved, discard, dirty, stale } = useDraft(settings)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const setField = (field, value) => {
    setError('')
    update((current) => ({ ...current, [field]: value }))
  }

  const autoOn = draft.autoSchedule !== false

  const save = async () => {
    const validTime = (value) => /^\d{2}:\d{2}$/.test(value ?? '')
    if (!validTime(draft.openingTime) || !validTime(draft.closingTime)) {
      setError('Completa la hora de apertura y la de cierre.')
      return
    }
    // Con formato "HH:MM" de 24 h, comparar como texto equivale a comparar horas
    if (draft.closingTime <= draft.openingTime) {
      setError('La hora de cierre debe ser posterior a la de apertura.')
      return
    }
    if (autoOn && parseDays(draft.openDays, []).length === 0) {
      setError('Marca al menos un día de apertura, si no la tienda nunca abre sola.')
      return
    }
    if (parseDays(draft.pickupDays, []).length === 0 && parseDays(draft.deliveryDays, []).length === 0) {
      setError('Deja activo recoger o envío en algún día, si no nadie puede pedir.')
      return
    }

    setBusy(true)
    const result = await onSave(draft)
    setBusy(false)
    if (result?.ok !== false) markSaved()
  }

  return (
    <div className="space-y-4">
      {/* Horario automático */}
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-brand-200 bg-brand-50 p-3">
        <span className="text-xl">🤖</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-ink">Horario automático</span>
          <span className="block text-[11px] font-semibold text-ink-soft">
            La tienda se abre y se cierra sola según los días y las horas de abajo.
          </span>
        </span>
        <input
          type="checkbox"
          checked={autoOn}
          onChange={(event) => setField('autoSchedule', event.target.checked)}
          className="size-5 accent-brand-600"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Field label="🕐 Abre">
          <input
            type="time"
            value={draft.openingTime ?? '12:00'}
            onChange={(event) => setField('openingTime', event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="🌙 Cierra">
          <input
            type="time"
            value={draft.closingTime ?? '20:00'}
            onChange={(event) => setField('closingTime', event.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <DaySelector
        icon="🏬"
        label="Días que abre"
        hint="Fuera de estos días la tienda aparece cerrada"
        value={draft.openDays}
        onChange={(value) => setField('openDays', value)}
      />

      <DaySelector
        icon="🏪"
        label="Recoger en el puesto"
        hint="Solo estos días se ofrece recoger"
        value={draft.pickupDays}
        onChange={(value) => setField('pickupDays', value)}
      />

      <DaySelector
        icon="🛵"
        label="Envío a domicilio"
        hint="Solo estos días se ofrece envío"
        value={draft.deliveryDays}
        onChange={(value) => setField('deliveryDays', value)}
      />

      <p className="rounded-2xl bg-cream p-3 text-[11px] font-semibold text-ink-soft">
        💡 Esto es la regla general. Para un cambio de un solo día (abrir un lunes, cerrar porque
        no vas a vender) usa la pestaña <strong>Tienda</strong>: ahí se ajusta solo hoy y mañana
        vuelve esta regla.
      </p>

      <Field label="📍 Dirección del puesto">
        <textarea
          rows="2"
          value={draft.address ?? ''}
          onChange={(event) => setField('address', event.target.value)}
          className={`${inputClass} resize-none`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="💸 Costo de envío">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={draft.deliveryCost ?? 0}
            onChange={(event) => setField('deliveryCost', Number(event.target.value) || 0)}
            className={inputClass}
          />
        </Field>
        <Field label="⏱️ Preparación (min)">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={draft.preparationTime ?? 0}
            onChange={(event) => setField('preparationTime', Number(event.target.value) || 0)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="🗓️ Intervalo entre horarios (min)" hint="Cada cuánto se ofrece una hora nueva">
        <input
          type="number"
          min="5"
          step="5"
          inputMode="numeric"
          value={draft.scheduleInterval ?? 20}
          onChange={(event) => setField('scheduleInterval', Number(event.target.value) || 20)}
          className={inputClass}
        />
      </Field>

      <div className="sticky bottom-0 -mx-5 border-t border-line bg-cream px-5 py-3">
        {stale && <StaleNotice onDiscard={discard} />}
        {error && (
          <p className="mb-2 rounded-xl bg-chili-500/10 px-3 py-2 text-xs font-bold text-chili-600">
            {error}
          </p>
        )}
        <Button variant="primary" size="lg" full disabled={!dirty || busy} onClick={save}>
          {busy ? 'Guardando…' : dirty ? 'Guardar cambios' : 'Todo guardado'}
        </Button>
      </div>
    </div>
  )
}

export default DeliveryTab
