// src/lib/whatsapp.js
import { money, prettyTime } from './format'

const RULE = '━━━━━━━━━━━━━━━━━━'

/**
 * Construye el mensaje de WhatsApp con el resumen del pedido.
 * Se mantiene fuera de los componentes para poder probarlo y ajustarlo
 * sin tocar la interfaz.
 */
export const buildOrderMessage = ({ items, subtotal, delivery, payment }) => {
  const lines = []

  lines.push('🍿 *NUEVO PEDIDO — BOTANAS MONY* 🍿', '')
  lines.push(delivery?.customerName ? `¡Hola Mony! Soy *${delivery.customerName}*.` : '¡Hola Mony!')
  lines.push('Quiero hacer este pedido:', '')

  items.forEach((item, index) => {
    const half = item.size === 'mitad' ? ' (Mitad)' : ''
    const qty = item.qty > 1 ? `${item.qty}× ` : ''
    lines.push(`📦 *${index + 1}. ${qty}${item.name}*${half} — ${money(item.unitPrice * item.qty)}`)

    if (item.added?.length) lines.push(`   ➕ Con: ${item.added.join(', ')}`)
    if (item.removed?.length) lines.push(`   ➖ Sin: ${item.removed.join(', ')}`)
    if (item.note) lines.push(`   📝 Nota: ${item.note}`)
    lines.push('')
  })

  lines.push(RULE)

  if (delivery) {
    const isDelivery = delivery.method === 'delivery'
    lines.push(`🛵 *Método:* ${isDelivery ? 'Envío a domicilio' : 'Recoger en el puesto'}`)
    lines.push(`📍 *Dirección:* ${delivery.address}`)
    lines.push(
      `🕐 *Horario:* ${delivery.time === 'asap' ? 'Lo antes posible' : prettyTime(delivery.time)}`,
    )
    if (delivery.phone) lines.push(`📱 *Teléfono:* ${delivery.phone}`)
    lines.push('')
    lines.push(`Subtotal: ${money(subtotal)}`)
    if (delivery.deliveryCost > 0) lines.push(`Envío: ${money(delivery.deliveryCost)}`)
    lines.push(`💰 *TOTAL: ${money(delivery.finalTotal)}*`)
  } else {
    lines.push(`💰 *TOTAL: ${money(subtotal)}*`)
  }

  lines.push(RULE, '')
  lines.push(`✅ Pago por transferencia a ${payment?.banco ?? 'la cuenta del negocio'}.`)
  lines.push('Enseguida envío mi comprobante 📸')

  return lines.join('\n')
}

/** Enlace de WhatsApp con el mensaje ya escrito. */
export const whatsAppUrl = (phone, message) => {
  const digits = String(phone ?? '').replace(/\D/g, '')
  const number = digits.length === 10 ? `52${digits}` : digits
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

/**
 * Abre WhatsApp. Devuelve false si el navegador bloqueó la ventana emergente,
 * para no decirle al cliente "ya se abrió" cuando no pasó nada.
 */
export const openWhatsApp = (phone, message) => {
  const opened = window.open(whatsAppUrl(phone, message), '_blank', 'noopener,noreferrer')
  return Boolean(opened)
}
