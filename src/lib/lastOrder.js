// src/lib/lastOrder.js
//
// Guarda un resumen del último pedido enviado para que el comprobante pueda
// decir de qué pedido es. Vive solo en el celular del cliente y caduca:
// mandar un comprobante citando un pedido de la semana pasada confundiría
// más de lo que ayuda.

const STORAGE_KEY = 'bm.lastOrder'
const MAX_AGE_MS = 12 * 60 * 60 * 1000 // 12 horas

export const saveLastOrder = (order) => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...order, savedAt: new Date().toISOString() }),
    )
  } catch {
    /* sin almacenamiento: el comprobante simplemente irá sin el resumen */
  }
}

export const readLastOrder = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const order = JSON.parse(raw)
    if (!order?.savedAt) return null

    const age = Date.now() - new Date(order.savedAt).getTime()
    if (Number.isNaN(age) || age > MAX_AGE_MS) return null

    // Sin un total válido el resumen diría "$0", peor que no decir nada
    if (!Number.isFinite(order.total)) return null

    return order
  } catch {
    return null
  }
}
