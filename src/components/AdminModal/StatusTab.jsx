// src/components/AdminModal/StatusTab.jsx
import Button from '../ui/Button'
import { cn, prettyTime } from '../../lib/format'
import { DAY_NAMES, DAY_SHORT } from '../../lib/schedule'

const daysLabel = (days) => {
  if (days.length === 7) return 'todos los días'
  if (days.length === 0) return 'ningún día'
  if (days.length === 1) return `solo ${DAY_NAMES[days[0]]}`
  return days.map((day) => DAY_SHORT[day]).join(' · ')
}

/** Interruptor de "hoy" con indicación de lo que haría el horario automático. */
const TodaySwitch = ({ icon, label, auto, value, isManual, onChange }) => (
  <div className="flex items-center gap-3 rounded-2xl border-2 border-line bg-white p-3">
    <span className="text-xl">{icon}</span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-extrabold text-ink">{label}</span>
      <span className="block text-[11px] font-semibold text-ink-faint">
        {isManual ? `Cambiado a mano · el horario dice ${auto ? 'sí' : 'no'}` : 'Según el horario'}
      </span>
    </span>
    <input
      type="checkbox"
      checked={Boolean(value)}
      onChange={(event) => onChange(event.target.checked)}
      aria-label={label}
      className="size-5 accent-brand-600"
    />
  </div>
)

const StatusTab = ({
  schedule,
  scheduleLabel,
  settings,
  isOnline,
  adminEmail,
  onSetOpenToday,
  onSetPickupToday,
  onSetDeliveryToday,
  onClearAdjustment,
  onSignOut,
}) => (
  <div className="space-y-4">
    <div
      className={cn(
        'rounded-3xl p-6 text-center text-white shadow-lift transition',
        schedule.isOpen
          ? 'bg-linear-to-br from-lima-500 to-lima-600'
          : 'bg-linear-to-br from-ink-soft to-ink',
      )}
    >
      <span className="block text-5xl">{schedule.isOpen ? '🟢' : '🔴'}</span>
      <p className="mt-2 font-display text-2xl font-extrabold">
        {schedule.isOpen ? 'Tienda abierta' : 'Tienda cerrada'}
      </p>
      <p className="mt-1 text-sm text-white/85">{scheduleLabel}</p>
    </div>

    {/* Resumen del horario automático */}
    <div className="rounded-2xl border border-line bg-white p-4 text-sm">
      <p className="font-display text-sm font-extrabold text-ink">🗓️ Horario automático</p>
      {settings.autoSchedule === false ? (
        <p className="mt-1 text-xs font-semibold text-ink-soft">
          Apagado: la tienda queda cerrada y solo abre si la abres a mano cada día. Se enciende
          en la pestaña Entrega.
        </p>
      ) : (
        <ul className="mt-1 space-y-0.5 text-xs font-semibold text-ink-soft">
          <li>
            🕐 De {prettyTime(settings.openingTime)} a {prettyTime(settings.closingTime)},{' '}
            {daysLabel(schedule.openDays)}
          </li>
          <li>🏪 Recoger en el puesto: {daysLabel(schedule.pickupDays)}</li>
          <li>🛵 Envío a domicilio: {daysLabel(schedule.deliveryDays)}</li>
        </ul>
      )}
      <p className="mt-2 text-[11px] text-ink-faint">
        Se cambia en la pestaña Entrega. Aquí solo se ajusta el día de hoy.
      </p>
    </div>

    {/* Ajustes de hoy */}
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="font-display text-base font-extrabold text-ink">✋ Solo por hoy</h4>
        {schedule.hasManual && (
          <button
            type="button"
            onClick={onClearAdjustment}
            className="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-brand-700 transition active:scale-95"
          >
            Volver al automático
          </button>
        )}
      </div>

      <Button
        variant={schedule.isOpen ? 'danger' : 'primary'}
        size="lg"
        full
        onClick={() => onSetOpenToday(!schedule.isOpen)}
      >
        {schedule.isOpen ? '🔴 Cerrar solo por hoy' : '🟢 Abrir solo por hoy'}
      </Button>

      <div className="mt-2 space-y-2">
        <TodaySwitch
          icon="🏪"
          label="Recoger en el puesto"
          auto={schedule.autoPickup}
          value={schedule.pickupToday}
          isManual={schedule.manualPickup}
          onChange={onSetPickupToday}
        />
        <TodaySwitch
          icon="🛵"
          label="Envío a domicilio"
          auto={schedule.autoDelivery}
          value={schedule.deliveryToday}
          isManual={schedule.manualDelivery}
          onChange={onSetDeliveryToday}
        />
      </div>

      <p className="mt-2 text-[11px] font-semibold text-ink-faint">
        Todo lo de esta sección se borra solo a medianoche: mañana vuelve a mandar el horario.
      </p>
    </section>

    {/* Estado técnico */}
    <div className="rounded-2xl border border-line bg-white p-4 text-sm">
      <div className="flex items-center justify-between py-1.5">
        <span className="font-semibold text-ink-soft">Servidor</span>
        <span className={cn('font-extrabold', isOnline ? 'text-lima-600' : 'text-chili-600')}>
          {isOnline ? 'Conectado' : 'Sin conexión'}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-line py-1.5">
        <span className="font-semibold text-ink-soft">Sesión</span>
        <span className="max-w-[60%] truncate font-extrabold text-ink">{adminEmail}</span>
      </div>
    </div>

    {!isOnline && (
      <p className="rounded-2xl bg-brand-50 p-3 text-xs font-semibold text-brand-900">
        ⚠️ Sin conexión los cambios solo se guardan en este dispositivo y los clientes no los verán.
      </p>
    )}

    <Button variant="ghost" full onClick={onSignOut}>
      Cerrar sesión
    </Button>
  </div>
)

export default StatusTab
