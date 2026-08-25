// src/context/StoreContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  allIngredients as seedIngredients,
  deliveryConfig as seedDelivery,
  paymentData,
  productsData as seedProducts,
} from '../data/products'
import {
  isFirebaseReady,
  listenToConnection,
  listenToDeliveryConfig,
  listenToIngredients,
  listenToProducts,
  listenToStoreStatus,
  onAuthChange,
  saveDayOverride,
  saveDeliveryConfig,
  saveIngredients,
  saveProducts,
  signIn,
  signOut,
} from '../lib/firebase'
import { dateKey, describeSchedule, resolveStoreState } from '../lib/schedule'

const StoreContext = createContext(null)

const KEYS = {
  products: 'bm.products',
  delivery: 'bm.deliverySettings',
  status: 'bm.dayOverride',
  ingredients: 'bm.ingredients',
}

/**
 * Lee del localStorage de forma síncrona para el estado inicial.
 * Así la app pinta al instante y Firebase solo *actualiza* después:
 * antes el respaldo llegaba tarde y podía pisar los datos frescos.
 */
const readCache = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = JSON.parse(raw)
    // "null" es una cadena con valor: sin este guard, un dato viejo o corrupto
    // dejaría el estado en null y la app reventaría en el primer render.
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const writeCache = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* modo privado o almacenamiento lleno: no es crítico */
  }
}

// Si el servidor no responde en este tiempo, seguimos con los datos locales
// en vez de dejar al cliente en la pantalla de carga para siempre.
const CONNECT_TIMEOUT = 5000

// Cada cuánto se revisa si ya llegó la hora de abrir o de cerrar.
const CLOCK_INTERVAL = 30000

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState(() => readCache(KEYS.products, seedProducts))
  const [ingredients, setIngredients] = useState(() => readCache(KEYS.ingredients, seedIngredients))
  // La caché se fusiona SOBRE la semilla: si viene de una versión anterior le
  // faltan los campos del horario, y sin ellos el "solo sábados" se perdería.
  const [deliverySettings, setDeliverySettings] = useState(() => ({
    ...seedDelivery,
    ...readCache(KEYS.delivery, {}),
  }))
  const [dayOverride, setDayOverride] = useState(() => readCache(KEYS.status, null))
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const [adminUser, setAdminUser] = useState(null)

  // Marca de tiempo que avanza sola: es lo que hace que la tienda se abra y
  // se cierre sin recargar la página ni entrar al panel.
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), CLOCK_INTERVAL)
    // Al volver de segundo plano el temporizador puede haberse retrasado
    const onFocus = () => setNow(new Date())
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)

    return () => {
      window.clearInterval(tick)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [])

  useEffect(() => {
    if (!isFirebaseReady()) {
      setLoading(false)
      return undefined
    }

    let settled = false
    const ready = () => {
      if (settled) return
      settled = true
      setLoading(false)
    }

    const timeout = window.setTimeout(ready, CONNECT_TIMEOUT)

    const unsubscribers = [
      listenToConnection(setIsOnline),
      listenToStoreStatus((status) => {
        // Si el nodo se borra en el servidor, el ajuste local también se va:
        // si no, este dispositivo seguiría con la tienda cerrada él solo.
        const next = status && typeof status === 'object' ? status : null
        setDayOverride(next)
        writeCache(KEYS.status, next)
        ready()
      }),
      listenToProducts((list) => {
        if (list?.length) {
          setProducts(list)
          writeCache(KEYS.products, list)
        }
      }),
      listenToDeliveryConfig((config) => {
        if (config) {
          setDeliverySettings((current) => {
            // Se guarda el objeto YA fusionado: si el servidor manda una
            // config parcial, la caché no puede quedarse sin campos o la
            // próxima carga perdería la dirección o los métodos de entrega.
            const merged = { ...current, ...config }
            writeCache(KEYS.delivery, merged)
            return merged
          })
        }
      }),
      listenToIngredients((list) => {
        if (list?.length) {
          setIngredients(list)
          writeCache(KEYS.ingredients, list)
        }
      }),
      onAuthChange(setAdminUser),
    ]

    return () => {
      window.clearTimeout(timeout)
      unsubscribers.forEach((unsubscribe) => unsubscribe?.())
    }
  }, [])

  /* ---------------------------- Estado calculado --------------------------- */

  const schedule = useMemo(
    () => resolveStoreState(deliverySettings, dayOverride, now),
    [deliverySettings, dayOverride, now],
  )

  const scheduleLabel = useMemo(
    () => describeSchedule(deliverySettings, schedule, now),
    [deliverySettings, schedule, now],
  )

  /**
   * Config de entrega tal como aplica HOY: los métodos ya vienen resueltos
   * según el día de la semana y los ajustes manuales, para que la pantalla
   * de entrega no tenga que saber nada del calendario.
   */
  const todayDelivery = useMemo(
    () => ({
      ...deliverySettings,
      pickupEnabled: schedule.pickupEnabled,
      deliveryEnabled: schedule.deliveryEnabled,
    }),
    [deliverySettings, schedule.pickupEnabled, schedule.deliveryEnabled],
  )

  /* ----------------------------- Acciones admin ---------------------------- */

  /**
   * Actualiza al instante y, si el servidor rechaza el cambio (por ejemplo
   * porque caducó la sesión de admin), deja todo como estaba: así la pantalla
   * nunca muestra algo distinto a lo que ven los clientes.
   */
  const optimistic = useCallback(async ({ previous, apply, cacheKey, save }) => {
    apply()
    writeCache(cacheKey, previous.next)

    const result = await save()
    if (result?.ok === false) {
      previous.revert()
      writeCache(cacheKey, previous.value)
    }
    return result
  }, [])

  /**
   * Ajuste manual del día. `patch` puede traer isOpen / pickup / delivery;
   * pasar `undefined` en un campo lo devuelve al horario automático.
   */
  const setDayAdjustment = useCallback(
    async (patch) => {
      const today = dateKey(new Date())
      const base = dayOverride?.date === today ? dayOverride : { date: today }
      const next = { ...base, ...patch, date: today }

      // Quitar las claves que volvieron a "automático"
      Object.keys(patch).forEach((key) => {
        if (patch[key] === undefined) delete next[key]
      })

      const before = dayOverride
      return optimistic({
        previous: { value: before, next, revert: () => setDayOverride(before) },
        apply: () => setDayOverride(next),
        cacheKey: KEYS.status,
        save: () => saveDayOverride(next),
      })
    },
    [dayOverride, optimistic],
  )

  /** Cierra o abre solo por hoy (mañana vuelve a mandar el horario). */
  const setOpenToday = useCallback((isOpen) => setDayAdjustment({ isOpen }), [setDayAdjustment])

  /** Activa o desactiva recoger en el puesto solo por hoy. */
  const setPickupToday = useCallback((pickup) => setDayAdjustment({ pickup }), [setDayAdjustment])

  /** Activa o desactiva el envío solo por hoy. */
  const setDeliveryToday = useCallback(
    (delivery) => setDayAdjustment({ delivery }),
    [setDayAdjustment],
  )

  /** Descarta todos los ajustes de hoy y deja mandar al horario. */
  const clearDayAdjustment = useCallback(
    () => setDayAdjustment({ isOpen: undefined, pickup: undefined, delivery: undefined }),
    [setDayAdjustment],
  )

  const updateProducts = useCallback(
    async (list) => {
      const before = products
      return optimistic({
        previous: { value: before, next: list, revert: () => setProducts(before) },
        apply: () => setProducts(list),
        cacheKey: KEYS.products,
        save: () => saveProducts(list),
      })
    },
    [products, optimistic],
  )

  const updateIngredients = useCallback(
    async (list) => {
      const before = ingredients
      return optimistic({
        previous: { value: before, next: list, revert: () => setIngredients(before) },
        apply: () => setIngredients(list),
        cacheKey: KEYS.ingredients,
        save: () => saveIngredients(list),
      })
    },
    [ingredients, optimistic],
  )

  const updateDeliverySettings = useCallback(
    async (config) => {
      const before = deliverySettings
      return optimistic({
        previous: { value: before, next: config, revert: () => setDeliverySettings(before) },
        apply: () => setDeliverySettings(config),
        cacheKey: KEYS.delivery,
        save: () => saveDeliveryConfig(config),
      })
    },
    [deliverySettings, optimistic],
  )

  const categories = useMemo(() => {
    const found = products.filter((product) => product.available !== false).map((p) => p.category)
    return [...new Set(found)].filter(Boolean)
  }, [products])

  const value = useMemo(
    () => ({
      products,
      categories,
      ingredients,
      deliverySettings,
      todayDelivery,
      payment: paymentData,

      clock: now,
      schedule,
      scheduleLabel,
      isStoreOpen: schedule.isOpen,

      loading,
      isOnline,
      adminUser,
      isAdmin: Boolean(adminUser),
      signIn,
      signOut,

      setOpenToday,
      setPickupToday,
      setDeliveryToday,
      clearDayAdjustment,
      updateProducts,
      updateIngredients,
      updateDeliverySettings,
    }),
    [
      products,
      categories,
      ingredients,
      deliverySettings,
      todayDelivery,
      now,
      schedule,
      scheduleLabel,
      loading,
      isOnline,
      adminUser,
      setOpenToday,
      setPickupToday,
      setDeliveryToday,
      clearDayAdjustment,
      updateProducts,
      updateIngredients,
      updateDeliverySettings,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return context
}
