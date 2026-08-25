// src/lib/schedule.js
import { prettyTime } from './format'

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

/** getDay() de JavaScript: 0 = domingo. */
export const DAY_NAMES = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
]

// Dos letras porque "M" sola no distingue martes de miércoles
export const DAY_SHORT = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']

const toMinutes = (hhmm, fallback = 0) => {
  if (typeof hhmm !== 'string') return fallback

  // Se exige el formato completo "H:MM"/"HH:MM": con un split suelto, una
  // hora vacía se colaba como NaN y el puesto se quedaba sin horarios.
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!match) return fallback

  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 23 || m > 59) return fallback

  return h * 60 + m
}

const toLabel = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/** "2026-08-25" en hora local, para saber si un ajuste manual sigue siendo de hoy. */
export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`

/**
 * Los días se guardan como texto ("0,6") y no como arreglo a propósito:
 * Realtime Database borra los arreglos vacíos, así que "ningún día" se
 * volvería "todos los días" al recargar.
 */
export const formatDays = (days) => [...new Set(days)].sort((a, b) => a - b).join(',')

export const parseDays = (value, fallback = ALL_DAYS) => {
  if (value === undefined || value === null) return fallback

  const raw =
    typeof value === 'string'
      ? value.split(',')
      : typeof value === 'number'
        ? [value]
        : Array.isArray(value)
          ? value
          : typeof value === 'object'
            ? Object.values(value)
            : []

  const days = raw
    .map((item) => String(item).trim())
    // Sin este filtro, "" se convertiría en 0 y "ningún día" pasaría a ser domingo
    .filter((item) => item !== '')
    .map(Number)
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)

  return [...new Set(days)].sort((a, b) => a - b)
}

/**
 * Genera los horarios disponibles para HOY.
 *
 * Trabaja en minutos desde medianoche, así que funciona aunque el intervalo
 * no sea divisor de 60 (ej. 25 min) y nunca genera horarios pasados.
 */
export const generateTimeSlots = (config, now = new Date()) => {
  const opening = toMinutes(config?.openingTime, 12 * 60)
  const closing = toMinutes(config?.closingTime, 20 * 60)
  const interval = Math.max(5, Number(config?.scheduleInterval) || 20)
  const prep = Math.max(0, Number(config?.preparationTime) || 0)

  if (closing <= opening) return []

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const earliest = nowMinutes + prep + 5

  const slots = []
  for (let m = opening; m <= closing; m += interval) {
    if (m >= earliest) slots.push({ value: toLabel(m), label: toLabel(m) })
  }
  return slots
}

/** ¿El puesto está dentro de su horario en este momento? */
export const isWithinBusinessHours = (config, now = new Date()) => {
  const opening = toMinutes(config?.openingTime, 12 * 60)
  const closing = toMinutes(config?.closingTime, 20 * 60)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return nowMinutes >= opening && nowMinutes <= closing
}

/** Próximo día (0-6) en el que abre, empezando por mañana. */
const nextOpenDay = (openDays, today) => {
  for (let offset = 1; offset <= 7; offset += 1) {
    const day = (today + offset) % 7
    if (openDays.includes(day)) return { day, offset }
  }
  return null
}

/**
 * Decide si la tienda está abierta ahora mismo y qué formas de entrega
 * aplican hoy, combinando el horario automático con el ajuste manual del día.
 *
 * El ajuste manual solo vale para la fecha en que se hizo: al día siguiente
 * el horario automático vuelve a mandar solo, para que no se quede la tienda
 * cerrada por olvido.
 */
export const resolveStoreState = (config = {}, override = null, now = new Date()) => {
  const day = now.getDay()
  const manual = override && override.date === dateKey(now) ? override : null

  const auto = config.autoSchedule !== false
  const openDays = parseDays(config.openDays, ALL_DAYS)
  const pickupDays = parseDays(config.pickupDays, ALL_DAYS)
  const deliveryDays = parseDays(config.deliveryDays, ALL_DAYS)

  const withinHours = isWithinBusinessHours(config, now)
  const isOpenDay = openDays.includes(day)

  // Con el horario automático apagado la tienda queda CERRADA por defecto y
  // solo se abre a mano cada día. Al revés (abierta por defecto) se quedaría
  // abierta las 24 horas en cuanto caducara el ajuste manual a medianoche.
  const autoOpen = auto ? isOpenDay && withinHours : false

  const manualOpen = typeof manual?.isOpen === 'boolean'
  const isOpen = manualOpen ? manual.isOpen : autoOpen

  const autoPickup = auto ? pickupDays.includes(day) : pickupDays.length > 0
  const autoDelivery = auto ? deliveryDays.includes(day) : deliveryDays.length > 0

  const manualPickup = typeof manual?.pickup === 'boolean'
  const manualDelivery = typeof manual?.delivery === 'boolean'

  // Lo que aplica hoy, sin mirar todavía si la tienda está abierta: es lo que
  // deben reflejar los interruptores del panel, para que se puedan mover
  // aunque el puesto aún no abra.
  const pickupToday = manualPickup ? manual.pickup : autoPickup
  const deliveryToday = manualDelivery ? manual.delivery : autoDelivery

  return {
    isOpen,
    pickupToday,
    deliveryToday,
    // Solo tiene sentido ofrecer una entrega si la tienda está abierta
    pickupEnabled: isOpen && pickupToday,
    deliveryEnabled: isOpen && deliveryToday,

    autoOpen,
    autoPickup,
    autoDelivery,
    manualOpen,
    manualPickup,
    manualDelivery,
    hasManual: manualOpen || manualPickup || manualDelivery,

    isOpenDay,
    withinHours,
    openDays,
    pickupDays,
    deliveryDays,
  }
}

/** Frase corta para el cliente: "Abierto hasta las 8:00 pm", "Abre a la 1:00 pm"… */
export const describeSchedule = (config = {}, state, now = new Date()) => {
  if (state.isOpen) {
    // Sin horario automático nada va a cerrar la tienda a una hora concreta,
    // así que prometer "hasta las 8" sería mentira.
    if (config.autoSchedule === false || state.manualOpen) return 'Abierto ahora'
    return `Abierto hasta las ${prettyTime(config.closingTime ?? '20:00')}`
  }

  if (config.autoSchedule === false) return 'Cerrado'
  if (state.manualOpen) return 'Cerrado por hoy'

  const opening = prettyTime(config.openingTime ?? '12:00')

  if (state.isOpenDay && !state.withinHours) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    if (nowMinutes < toMinutes(config.openingTime, 12 * 60)) return `Abre hoy a las ${opening}`
  }

  const next = nextOpenDay(state.openDays, now.getDay())
  if (!next) return 'Cerrado'
  if (next.offset === 1) return `Abre mañana a las ${opening}`
  return `Abre el ${DAY_NAMES[next.day]} a las ${opening}`
}
