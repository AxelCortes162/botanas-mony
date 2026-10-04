// src/lib/whatsapp.js
import { money, prettyTime } from './format'

const RULE = '━━━━━━━━━━━━━━━━━━'

export const POINTS_URL = 'https://tocaaqui.app/c/mony'

/** 10 dígitos o '' si no se puede. Acepta espacios, guiones y +52 / 52 al inicio. */
export const normalizePhone = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  const local = digits.length > 10 && digits.startsWith('52') ? digits.slice(-10) : digits
  return local.length === 10 ? local : ''
}

/**
 * Enlace que Mony toca cuando ya cobró: tocaaqui lo lee tal cual. Va después
 * del # para que el teléfono y el código no viajen a ningún servidor.
 */
export const pointsCashierUrl = ({ phone, finalTotal, deliveryCost, reward, rewardCode, orderId }) => {
  const params = new URLSearchParams({ tel: phone, total: String(finalTotal) })
  // El envío no da puntos: tocaaqui lo resta del total antes de calcularlos
  if (deliveryCost > 0) params.set('envio', String(deliveryCost))
  if (reward) {
    params.set('premio', String(reward.id))
    params.set('codigo', rewardCode)
  }
  params.set('pedido', orderId)
  return `${POINTS_URL}/caja#${params}`
}

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

    // La lista COMPLETA de lo que va en el vaso: esta línea es la instrucción
    // de preparación. Antes solo se mandaban los cambios (con/sin) y había que
    // acordarse de memoria de la receta base de cada producto.
    const hasChanges = Boolean(item.added?.length || item.removed?.length)

    if (item.ingredients?.length) {
      lines.push(`   🥗 *LLEVA:* ${item.ingredients.join(', ')}`)
    } else if (hasChanges) {
      // Personalizable al que le quitaron todo
      lines.push('   🥗 *LLEVA:* nada, solo el producto')
    }

    // Los cambios van aparte para que salten a la vista y no se prepare en
    // automático como siempre
    if (item.added?.length) lines.push(`   ➕ _Extra:_ ${item.added.join(', ')}`)
    if (item.removed?.length) lines.push(`   ➖ _SIN:_ ${item.removed.join(', ')}`)
    if (item.note) lines.push(`   📝 _Nota:_ ${item.note}`)

    lines.push('')
  })

  // Va con los productos: es algo más que Mony tiene que preparar
  if (delivery?.reward) {
    const { nombre, puntos } = delivery.reward
    lines.push(`🎁 *PREMIO GRATIS: ${nombre}* (${puntos} puntos)`, '')
  }

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

  if (delivery?.phone) {
    lines.push('', '🎁 *Para Mony, cuando ya esté pagado:*', pointsCashierUrl(delivery))
  }

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