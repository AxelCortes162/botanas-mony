// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, onValue } from 'firebase/database'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
} from 'firebase/auth'

// La config de Firebase es pública por diseño: la seguridad real vive en
// database.rules.json (solo un usuario autenticado puede escribir).
// Aun así se puede sobreescribir por entorno para separar dev / producción.
const env = import.meta.env

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAsvhj1JKzPR-DcC0U8Z5MyvZFrihHJtuA',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? 'botanas-mony-ca4d0.firebaseapp.com',
  databaseURL:
    env.VITE_FIREBASE_DATABASE_URL ?? 'https://botanas-mony-ca4d0-default-rtdb.firebaseio.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? 'botanas-mony-ca4d0',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? 'botanas-mony-ca4d0.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '972334705995',
  appId: env.VITE_FIREBASE_APP_ID ?? '1:972334705995:web:a956c8a11ad2dd2d960cce',
}

let database = null
let auth = null

try {
  const app = initializeApp(firebaseConfig)
  database = getDatabase(app)
  auth = getAuth(app)
} catch (error) {
  console.warn('[Firebase] No se pudo inicializar:', error)
}

export const isFirebaseReady = () => database !== null

const PATHS = {
  status: 'store/status',
  products: 'store/products',
  delivery: 'store/delivery',
  ingredients: 'store/ingredients',
}

/** Escribe en la base y devuelve una promesa que nunca revienta la UI. */
const safeSet = async (path, data) => {
  if (!database) {
    return { ok: false, error: 'Sin conexión con el servidor' }
  }
  try {
    await set(ref(database, path), data)
    return { ok: true }
  } catch (error) {
    console.warn(`[Firebase] Error al escribir en ${path}:`, error)
    return { ok: false, error: error?.message ?? 'No se pudo guardar' }
  }
}

/** Suscripción segura. Devuelve siempre una función para cancelarla. */
const safeListen = (path, callback) => {
  if (!database) return () => {}
  try {
    return onValue(
      ref(database, path),
      (snapshot) => callback(snapshot.val()),
      (error) => console.warn(`[Firebase] Error al leer ${path}:`, error),
    )
  } catch (error) {
    console.warn(`[Firebase] No se pudo suscribir a ${path}:`, error)
    return () => {}
  }
}

/* ------------------------------- Escrituras ------------------------------ */

/**
 * Ajuste manual del día (abrir/cerrar, activar recoger o envío fuera de lo
 * que dicta el horario automático). Se guarda con la fecha para que caduque
 * solo: mañana vuelve a mandar el horario.
 *
 * Las claves en `undefined` se omiten, y así el campo vuelve a "automático".
 */
export const saveDayOverride = (override) => {
  const payload = { date: override.date, lastUpdated: new Date().toISOString() }
  if (typeof override.isOpen === 'boolean') payload.isOpen = override.isOpen
  if (typeof override.pickup === 'boolean') payload.pickup = override.pickup
  if (typeof override.delivery === 'boolean') payload.delivery = override.delivery
  return safeSet(PATHS.status, payload)
}

export const saveProducts = (products) => {
  const productsObj = {}
  products.forEach((product) => {
    productsObj[product.id] = product
  })
  return safeSet(PATHS.products, productsObj)
}

export const saveDeliveryConfig = (config) => safeSet(PATHS.delivery, config)

export const saveIngredients = (ingredients) => safeSet(PATHS.ingredients, ingredients)

/* ------------------------------- Lecturas -------------------------------- */

export const listenToStoreStatus = (callback) => safeListen(PATHS.status, callback)

export const listenToProducts = (callback) =>
  safeListen(PATHS.products, (data) => {
    if (!data) return callback(null)

    // OJO: los productos se guardan con el id como clave ("1".."9"). Realtime
    // Database convierte esos nodos en un ARRAY con huecos (el índice 0 llega
    // como null), así que hay que filtrar antes de ordenar o revienta el
    // listener entero y el menú se queda congelado en los datos locales.
    const list = Object.values(data)
      .filter((product) => product && typeof product === 'object' && product.id != null)
      .sort((a, b) => a.id - b.id)

    callback(list.length > 0 ? list : null)
  })

export const listenToDeliveryConfig = (callback) => safeListen(PATHS.delivery, callback)

export const listenToIngredients = (callback) =>
  safeListen(PATHS.ingredients, (data) => {
    if (!data) return callback(null)
    const list = (Array.isArray(data) ? data : Object.values(data)).filter(
      (item) => typeof item === 'string' && item.length > 0,
    )
    callback(list.length > 0 ? list : null)
  })

/** Estado real de la conexión con el servidor (se actualiza en vivo). */
export const listenToConnection = (callback) => {
  if (!database) {
    callback(false)
    return () => {}
  }
  try {
    return onValue(ref(database, '.info/connected'), (snapshot) => callback(Boolean(snapshot.val())))
  } catch {
    callback(false)
    return () => {}
  }
}

/* ----------------------------- Autenticación ----------------------------- */

const AUTH_ERRORS = {
  'auth/invalid-email': 'El correo no es válido',
  'auth/invalid-credential': 'Correo o contraseña incorrectos',
  'auth/wrong-password': 'Correo o contraseña incorrectos',
  'auth/user-not-found': 'Correo o contraseña incorrectos',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos',
  'auth/network-request-failed': 'Sin conexión a internet',
  'auth/operation-not-allowed': 'Falta activar el acceso por correo en Firebase',
}

export const signIn = async (email, password) => {
  if (!auth) return { ok: false, error: 'Sin conexión con el servidor' }
  try {
    await signInWithEmailAndPassword(auth, email.trim(), password)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: AUTH_ERRORS[error?.code] ?? 'No se pudo iniciar sesión' }
  }
}

export const signOut = async () => {
  if (!auth) return { ok: true }
  try {
    await fbSignOut(auth)
    return { ok: true }
  } catch (error) {
    console.warn('[Firebase] Error al cerrar sesión:', error)
    return { ok: false, error: 'No se pudo cerrar la sesión' }
  }
}

export const onAuthChange = (callback) => {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return fbOnAuthStateChanged(auth, callback)
}
