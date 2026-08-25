// src/lib/format.js

/** Une clases condicionales sin depender de librerías externas. */
export const cn = (...classes) => classes.filter(Boolean).join(' ')

/** $1,234 — sin decimales porque los precios del puesto son enteros. */
export const money = (amount) =>
  `$${Number(amount ?? 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

/** Texto normalizado para buscar sin acentos ni mayúsculas. */
export const normalize = (text = '') =>
  text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

/** "14:05" -> "2:05 pm" */
export const prettyTime = (hhmm) => {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h)) return hhmm
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}

/** Identificador único para las líneas del carrito. */
export const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}
