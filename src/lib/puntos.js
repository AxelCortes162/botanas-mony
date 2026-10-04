// src/lib/puntos.js
//
// Los puntos viven en tocaaqui: aquí solo se habla con su API. La lógica viene
// de ../tocaaqui/cliente.html; si algo cambia allá, hay que traerlo para acá.
import { codigo, VENTANA_MS } from './codigo'
import { isIos, isStandalone } from './pwa'

const API = 'https://tocaaqui.app/api/puntos'
const NEGOCIO = 'mony'
const TOKEN_KEY = 'bm.puntos.token'
const TEL_KEY = 'bm.puntos.tel'

/* ------------------------------- Guardado -------------------------------- */

const read = (key) => {
  try {
    return window.localStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

const write = (key, value) => {
  try {
    if (value) window.localStorage.setItem(key, value)
    else window.localStorage.removeItem(key)
  } catch {
    /* sin almacenamiento: tendrá que registrarse otra vez */
  }
}

export const getToken = () => read(TOKEN_KEY)
// La API no regresa el teléfono completo: se guarda aquí para prellenar el pedido
export const getSavedPhone = () => read(TEL_KEY)

export const forgetAccount = () => {
  write(TOKEN_KEY, '')
  write(TEL_KEY, '')
}

/* ---------------------------------- API ---------------------------------- */

/** Los errores traen un mensaje para mostrar tal cual, y el status (401 = token muerto). */
export const api = async (accion, datos = {}) => {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accion, ...datos }),
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw Object.assign(new Error(json.error || 'Algo falló. Intenta de nuevo.'), {
      status: response.status,
    })
  }
  return json
}

// Nombre, premios y llave de avisos casi nunca cambian: se piden una vez por
// visita. También da la hora del servidor, que es la que manda para el código.
let infoPromise = null
let clockOffset = 0 // reloj del servidor menos el del celular

export const loadInfo = () => {
  if (!infoPromise) {
    const sentAt = Date.now()
    infoPromise = api('info', { negocio: NEGOCIO })
      .then((info) => {
        clockOffset = info.ahora - Math.round((sentAt + Date.now()) / 2)
        return info
      })
      .catch((error) => {
        infoPromise = null // que el siguiente intento vuelva a preguntar
        throw error
      })
  }
  return infoPromise
}

export const register = async (phone, name) => {
  const { token } = await api('registrar', { negocio: NEGOCIO, telefono: phone, nombre: name })
  write(TOKEN_KEY, token)
  write(TEL_KEY, phone)
  return token
}

/** Saldo e historial. Si el token ya no sirve lo borra, para volver a pedir teléfono. */
export const loadAccount = async (token) => {
  try {
    return await api('cliente', { token })
  } catch (error) {
    if (error.status === 401) forgetAccount()
    throw error
  }
}

/* -------------------------------- Código --------------------------------- */

export const serverNow = () => Date.now() + clockOffset
export const currentWindow = () => Math.floor(serverNow() / VENTANA_MS)
/** 1 recién cambiado → 0 a punto de cambiar */
export const windowLeft = () => 1 - (serverNow() % VENTANA_MS) / VENTANA_MS
export const currentCode = (token) => codigo(token, currentWindow())

/* -------------------------------- Avisos --------------------------------- */

/**
 * La app instalada en iPhone no comparte nada con Safari: si se registrara
 * aquí, al instalar ya no tendría su token y el teléfono saldría "registrado
 * en otro celular". Por eso en iPhone solo se registra desde la app instalada.
 */
export const isIosBrowser = () => isIos() && !isStandalone()

export const supportsPush = (info) =>
  Boolean(info?.vapid) &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

/** La clave VAPID viaja en base64url; el navegador la quiere en bytes. */
const toBytes = (base64url) => {
  const clean = String(base64url ?? '').trim()
  if (!/^[A-Za-z0-9_-]+$/.test(clean) || clean.length < 80) {
    throw new Error('La clave VAPID pública está mal puesta en el servidor.')
  }
  const base64 = (clean + '='.repeat((4 - (clean.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
}

// En desarrollo el service worker no se registra (ver lib/pwa.js) y
// serviceWorker.ready se quedaría esperando para siempre.
const registration = () => navigator.serviceWorker.getRegistration('/')

export const currentSubscription = async () =>
  (await registration())?.pushManager.getSubscription() ?? null

export const enablePush = async (token, info) => {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Bloqueaste los avisos. Hay que volver a permitirlos desde los ajustes del navegador.'
        : 'No se concedió el permiso.',
    )
  }
  if (!(await registration())) {
    throw new Error('Los avisos solo funcionan en la página publicada, no en desarrollo.')
  }
  const reg = await navigator.serviceWorker.ready
  const subscription =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toBytes(info.vapid),
    }))
  await api('suscribir', { token, suscripcion: subscription.toJSON() })
  return subscription
}
