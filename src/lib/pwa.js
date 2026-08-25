// src/lib/pwa.js
//
// Registro del service worker e instalación en la pantalla de inicio.
//
// En desarrollo NO se registra, y además se da de baja cualquiera que haya
// quedado de una sesión anterior: un service worker vivo en `npm run dev`
// sirve archivos viejos y vuelve loco a cualquiera.

const SW_URL = '/sw.js'

/* --------------------------- Invitación a instalar ------------------------ */

// Chrome dispara `beforeinstallprompt` en cuanto se cumplen sus condiciones,
// muchas veces antes de que React termine de montar. Por eso se escucha aquí,
// al cargar el módulo, y no dentro de un componente: si se espera a que la
// pantalla de carga termine, el evento ya pasó y el botón "Instalar" no sale.
let deferredPrompt = null
const listeners = new Set()

const notifyListeners = () => listeners.forEach((listener) => listener(deferredPrompt))

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event
    notifyListeners()
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    notifyListeners()
  })
}

export const getInstallPrompt = () => deferredPrompt

/** Avisa cuando aparece (o se consume) la invitación del navegador. */
export const onInstallPromptChange = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const consumeInstallPrompt = async () => {
  const prompt = deferredPrompt
  if (!prompt) return { outcome: 'unavailable' }

  // Solo se puede usar una vez
  deferredPrompt = null
  notifyListeners()

  try {
    prompt.prompt()
    return await prompt.userChoice
  } catch {
    return { outcome: 'dismissed' }
  }
}

/* ----------------------------- Dónde se está ------------------------------ */

/** ¿La app se está viendo instalada y no dentro del navegador? */
export const isStandalone = () => {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    )
  } catch {
    return false
  }
}

/** iPhone y iPad: no tienen botón de instalar, hay que explicar el camino. */
export const isIos = () => {
  const ua = window.navigator.userAgent ?? ''
  const isApple = /iPad|iPhone|iPod/.test(ua)
  // iPadOS moderno se anuncia como Mac, pero con pantalla táctil
  const isIpadOs = /Macintosh/.test(ua) && (navigator.maxTouchPoints ?? 0) > 1
  return isApple || isIpadOs
}

/**
 * Navegador dentro de otra app (WhatsApp, Instagram, Facebook…).
 *
 * Importa porque el menú se comparte por WhatsApp: mucha gente lo abre ahí
 * dentro, y en ese navegador NO existe "Agregar a inicio". Decirle que lo
 * instale sería mandarlo a buscar un botón que no está.
 */
export const isInAppBrowser = () => {
  const ua = window.navigator.userAgent ?? ''
  return /FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|WhatsApp|WebView|GSA\//i.test(ua)
}

/* --------------------------- Service worker ------------------------------- */

// Al volver a la app se busca actualización, pero no más de una vez por minuto
const UPDATE_THROTTLE = 60000

/**
 * Registra el service worker.
 * @param {(activate: () => void) => void} onUpdateReady se llama cuando hay
 *        una versión nueva esperando; recibe la función que la activa.
 */
export const registerServiceWorker = async (onUpdateReady) => {
  if (!('serviceWorker' in navigator)) return

  if (import.meta.env.DEV) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
    return
  }

  // Se lee ANTES de registrar: si no había service worker, el `claim` de la
  // primera instalación también dispara `controllerchange`, y recargar ahí
  // le daría un salto raro a quien entra por primera vez.
  const hadController = navigator.serviceWorker.controller !== null

  try {
    // updateViaCache 'none' evita que un sw.js viejo se quede pegado en la
    // caché HTTP del navegador
    const registration = await navigator.serviceWorker.register(SW_URL, {
      scope: '/',
      updateViaCache: 'none',
    })

    const notify = (worker) => {
      if (!worker) return
      onUpdateReady?.(() => worker.postMessage({ type: 'SKIP_WAITING' }))
    }

    // Ya había una versión nueva esperando desde antes
    if (registration.waiting && navigator.serviceWorker.controller) {
      notify(registration.waiting)
    }

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing
      installing?.addEventListener('statechange', () => {
        // Sin `controller` es la primera instalación: no hay nada que avisar
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          notify(installing)
        }
      })
    })

    // Cuando el service worker NUEVO toma el control, se recarga una sola vez
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || refreshing) return
      refreshing = true
      window.location.reload()
    })

    let lastCheck = 0
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return

      const now = Date.now()
      if (now - lastCheck < UPDATE_THROTTLE) return
      lastCheck = now

      registration.update().catch(() => {})
    })
  } catch (error) {
    console.warn('[PWA] No se pudo registrar el service worker:', error)
  }
}
