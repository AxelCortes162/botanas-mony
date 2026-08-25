// src/lib/receipt.js
//
// Envío del comprobante de pago.
//
// OJO: un enlace wa.me solo puede llevar TEXTO, nunca un archivo. La única
// forma de que la foto llegue a WhatsApp desde una web es el menú de
// compartir del propio celular (Web Share API), que sí acepta archivos.
// Cuando el navegador no lo soporta, lo único honesto es abrir el chat con
// el mensaje escrito y pedirle al cliente que adjunte la foto él.
import { money, prettyTime } from './format'

/** 15 MB: de ahí para arriba WhatsApp suele comprimir o rechazar. */
export const MAX_RECEIPT_BYTES = 15 * 1024 * 1024

const ACCEPTED = ['image/', 'application/pdf']

export const RECEIPT_ACCEPT = 'image/*,application/pdf'

/** Revisa que el archivo elegido sirva como comprobante. */
export const validateReceipt = (file) => {
  if (!file) return { ok: false, error: 'Elige una foto o un PDF' }

  const typeOk = ACCEPTED.some((prefix) => (file.type ?? '').startsWith(prefix))
  if (!typeOk) return { ok: false, error: 'Tiene que ser una imagen o un PDF' }

  if (file.size > MAX_RECEIPT_BYTES) {
    return {
      ok: false,
      error: file.type === 'application/pdf'
        ? 'El PDF pesa más de 15 MB. Manda mejor una captura.'
        : 'La imagen pesa más de 15 MB. Tómala en menor calidad.',
    }
  }

  return { ok: true }
}

/** ¿Este navegador puede mandar el archivo por el menú de compartir? */
export const canShareFile = (file) => {
  try {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    )
  } catch {
    return false
  }
}

/**
 * Abre el menú de compartir del celular con el comprobante ya cargado.
 *
 * Devuelve un motivo en vez de lanzar, para que la pantalla decida qué
 * decirle al cliente: cancelar no es un error.
 */
export const shareReceipt = async (file, text) => {
  if (!canShareFile(file)) return { ok: false, reason: 'unsupported' }

  try {
    await navigator.share({ files: [file], text, title: 'Comprobante de pago' })
    return { ok: true }
  } catch (error) {
    if (error?.name === 'AbortError') return { ok: false, reason: 'cancelled' }
    console.warn('[Comprobante] No se pudo compartir:', error)
    return { ok: false, reason: 'error' }
  }
}

/** Texto que acompaña al comprobante. */
export const buildReceiptMessage = (order) => {
  const lines = ['🧾 *COMPROBANTE DE PAGO — BOTANAS MONY*', '']

  if (order?.customerName) {
    lines.push(`¡Hola Mony! Soy *${order.customerName}*.`)
  } else {
    lines.push('¡Hola Mony!')
  }

  lines.push('Aquí está mi comprobante de la transferencia 📸')

  if (order?.total) {
    lines.push('', `💰 Pedido por *${money(order.total)}*`)
    if (order.time && order.time !== 'asap') lines.push(`🕐 Para las ${prettyTime(order.time)}`)
  }

  return lines.join('\n')
}
