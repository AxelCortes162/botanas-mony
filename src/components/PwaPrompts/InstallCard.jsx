// src/components/PwaPrompts/InstallCard.jsx
import { useEffect, useState } from 'react'
import {
  consumeInstallPrompt,
  getInstallPrompt,
  isInAppBrowser,
  isIos,
  isStandalone,
  onInstallPromptChange,
} from '../../lib/pwa'

const DISMISS_KEY = 'bm.installDismissed'
const DISMISS_DAYS = 30

const wasDismissed = () => {
  try {
    const saved = window.localStorage.getItem(DISMISS_KEY)
    if (!saved) return false
    const age = Date.now() - Number(saved)
    return Number.isFinite(age) && age < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

const remember = () => {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {
    /* sin almacenamiento: volverá a aparecer, no es grave */
  }
}

/**
 * Invitación a instalar la app en la pantalla de inicio.
 *
 * En Android el navegador avisa con `beforeinstallprompt` (que se captura en
 * lib/pwa.js desde que carga la página) y se puede abrir el diálogo del
 * sistema. En iPhone no existe ese evento, así que lo único que se puede
 * hacer es explicar el camino: Compartir → Agregar a inicio.
 *
 * Se muestra en el flujo de la página, no flotando, para no tapar el menú.
 */
const InstallCard = () => {
  const [canInstall, setCanInstall] = useState(() => Boolean(getInstallPrompt()))
  const [dismissed, setDismissed] = useState(true)
  const [iosHelp, setIosHelp] = useState(false)

  useEffect(() => {
    // Ya instalada, dentro del navegador de otra app, o dijo que no hace poco
    if (isStandalone() || isInAppBrowser() || wasDismissed()) return undefined

    setDismissed(false)
    if (isIos()) setIosHelp(true)

    return onInstallPromptChange((prompt) => setCanInstall(Boolean(prompt)))
  }, [])

  const install = async () => {
    const choice = await consumeInstallPrompt()
    setDismissed(true)
    // Si dijo que no, no se vuelve a insistir en un mes
    if (choice?.outcome !== 'accepted') remember()
  }

  const dismiss = () => {
    setDismissed(true)
    remember()
  }

  // En Android solo tiene sentido si el navegador ya ofreció instalar
  if (dismissed || (!iosHelp && !canInstall)) return null

  return (
    <div className="mx-4 mt-4 flex animate-pop-in items-center gap-3 rounded-2xl border-2 border-brand-200 bg-white p-3 shadow-soft">
      <img src="/icons/icon-192.png" alt="" className="size-11 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-extrabold text-ink">Ten el menú a la mano</p>
        <p className="text-[11px] font-semibold leading-snug text-ink-soft">
          {iosHelp ? (
            <>
              Toca <span className="font-extrabold">Compartir</span> abajo y luego{' '}
              <span className="font-extrabold">Agregar a inicio</span>.
            </>
          ) : (
            'Instálalo y ábrelo como app, sin buscar el link.'
          )}
        </p>
      </div>

      {iosHelp ? (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar aviso"
          className="no-tap-highlight shrink-0 rounded-full px-2 text-lg text-ink-faint transition active:scale-90"
        >
          ×
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={install}
            className="no-tap-highlight rounded-full bg-brand-600 px-4 py-2 text-xs font-extrabold text-white transition active:scale-95"
          >
            Instalar
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Ahora no"
            className="no-tap-highlight rounded-full px-1.5 text-lg text-ink-faint transition active:scale-90"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default InstallCard
