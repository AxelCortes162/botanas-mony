// src/components/PwaPrompts/UpdateBanner.jsx
import { useEffect, useState } from 'react'
import { registerServiceWorker } from '../../lib/pwa'

/**
 * Registra el service worker y, cuando hay una versión nueva esperando,
 * ofrece actualizar. No se actualiza solo a media sesión: si alguien está a
 * medio pedido, recargarle la página sin avisar sería peor que esperar.
 */
const UpdateBanner = () => {
  const [activate, setActivate] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // La función se guarda envuelta: setState invoca cualquier función que
    // reciba, y aquí lo que queremos guardar ES una función.
    registerServiceWorker((activateUpdate) => setActivate(() => activateUpdate))
  }, [])

  if (!activate) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="flex w-full max-w-md items-center gap-3 rounded-full bg-ink px-4 py-2.5 text-white shadow-lift animate-slide-up">
        <span className="text-lg">✨</span>
        <p className="flex-1 text-xs font-extrabold">Hay una versión nueva del menú</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true)
            activate()
            // Si el service worker nuevo no llega a tomar el control, se
            // recarga a mano: peor sería dejar "Cargando…" para siempre.
            window.setTimeout(() => window.location.reload(), 6000)
          }}
          className="no-tap-highlight shrink-0 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-extrabold transition active:scale-95 disabled:opacity-60"
        >
          {busy ? 'Cargando…' : 'Actualizar'}
        </button>
        <button
          type="button"
          onClick={() => setActivate(null)}
          aria-label="Ahora no"
          className="no-tap-highlight shrink-0 text-lg leading-none text-white/60 transition active:scale-90"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default UpdateBanner
