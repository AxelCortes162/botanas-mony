/* global clients */
//
// Service worker de Botanas Mony.
//
// Está escrito a propósito de forma conservadora: un service worker mal hecho
// deja a los clientes atrapados en una versión vieja y eso es muy difícil de
// arreglar a distancia. Las reglas son:
//
//  1. Solo se tocan peticiones GET del mismo origen. Firebase, WhatsApp y las
//     fuentes de Google pasan de largo, sin caché ni interferencia.
//  2. El HTML va SIEMPRE a la red primero. Así un despliegue nuevo se ve al
//     recargar; la copia guardada solo entra si no hay internet.
//  3. Los archivos de /assets/ llevan hash en el nombre (los genera Vite), así
//     que ahí sí caché primero: si el contenido cambia, cambia el nombre.
//  4. Todo lo demás (fotos, logos, iconos) se sirve de la caché pero se
//     actualiza por detrás, porque esos nombres NO cambian nunca.
//
// BUILD_ID y ASSETS los reemplaza el plugin de vite.config.js en cada compilado
// con el hash del bundle y la lista real de archivos. Gracias a eso este
// archivo cambia en cada despliegue, que es lo único que hace al navegador
// darse cuenta de que hay versión nueva.

const BUILD_ID = '__BUILD_ID__'
const BUILD_ASSETS = '__BUILD_ASSETS__'

const VERSION = `bm-${BUILD_ID}`
const SHELL_CACHE = `${VERSION}-shell`
const ASSET_CACHE = `${VERSION}-assets`

// El HTML y el JS/CSS que le corresponde se guardan JUNTOS al instalar: así la
// app abre sin internet desde la primera visita, y el HTML guardado nunca
// apunta a un archivo que no esté también guardado.
const BUILD_FILES = (() => {
  try {
    const parsed = JSON.parse(BUILD_ASSETS)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})()

const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png']

const addAllSafely = async (cache, urls) =>
  Promise.all(
    urls.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)),
  )

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const [shell, assets] = await Promise.all([caches.open(SHELL_CACHE), caches.open(ASSET_CACHE)])
      await Promise.all([addAllSafely(shell, SHELL), addAllSafely(assets, BUILD_FILES)])
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          // Solo las nuestras: no se toca lo que guarden otras librerías
          .filter((key) => key.startsWith('bm-') && !key.startsWith(VERSION))
          .map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

// La página pide tomar el control cuando el usuario acepta actualizar
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

/**
 * Navegación: red primero.
 *
 * A propósito NO se guarda la respuesta: el shell sin internet es el que se
 * precargó al instalar, junto con sus archivos. Guardar cada navegación podría
 * dejar un HTML nuevo apuntando a archivos que no alcanzaron a bajarse, y la
 * app abriría en blanco la próxima vez que no haya red.
 */
const navigationStrategy = async (request) => {
  try {
    return await fetch(request)
  } catch (error) {
    const cache = await caches.open(SHELL_CACHE)
    const shell = (await cache.match(request)) ?? (await cache.match('/'))
    if (shell) return shell
    throw error
  }
}

/** Caché primero: solo para archivos cuyo nombre cambia cuando cambian. */
const cacheFirst = async (request) => {
  const cache = await caches.open(ASSET_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response && response.ok && response.type === 'basic') {
    cache.put(request, response.clone())
  }
  return response
}

/**
 * Se responde al instante con lo guardado y se busca una versión fresca por
 * detrás. Es lo que necesitan las fotos de producto y los logos: se ven
 * rápido, pero si Mony cambia una imagen los clientes la ven al poco rato.
 */
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(ASSET_CACHE)
  const cached = await cache.match(request)

  const fresh = fetch(request)
    .then((response) => {
      if (response && response.ok && response.type === 'basic') {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => undefined)

  return cached ?? (await fresh) ?? Response.error()
}

const isHashedAsset = (url) => url.pathname.startsWith('/assets/')

const isStaticMedia = (url) =>
  url.pathname.startsWith('/icons/') ||
  url.pathname.startsWith('/images/') ||
  /\.(png|jpe?g|webp|svg|woff2?)$/i.test(url.pathname)

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  let url
  try {
    url = new URL(request.url)
  } catch {
    return
  }

  // Todo lo de fuera (Firebase, WhatsApp, fuentes) se deja pasar tal cual
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request))
    return
  }

  if (isHashedAsset(url)) {
    event.respondWith(cacheFirst(request))
    return
  }

  if (isStaticMedia(url)) {
    event.respondWith(staleWhileRevalidate(request))
  }
})
