// src/context/ToastContext.jsx
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { cn, makeId } from '../lib/format'

const ToastContext = createContext(null)

const TONE = {
  success: 'bg-lima-600 text-white',
  error: 'bg-chili-600 text-white',
  info: 'bg-ink text-white',
  warning: 'bg-brand-500 text-white',
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)
  const resolverRef = useRef(null)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (message, tone = 'success', duration = 2600) => {
      const id = makeId()
      setToasts((current) => [...current, { id, message, tone }])
      window.setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  /** Reemplaza a window.confirm con un diálogo propio. Devuelve una promesa. */
  const confirm = useCallback((options) => {
    setConfirmState({
      title: options?.title ?? '¿Confirmas?',
      message: options?.message ?? '',
      confirmText: options?.confirmText ?? 'Sí, continuar',
      cancelText: options?.cancelText ?? 'Cancelar',
      danger: options?.danger ?? false,
    })
    return new Promise((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const closeConfirm = useCallback((result) => {
    setConfirmState(null)
    resolverRef.current?.(result)
    resolverRef.current = null
  }, [])

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm])

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Avisos */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[200] flex flex-col items-center gap-2 px-4">
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              'pointer-events-auto max-w-sm animate-pop-in rounded-full px-4 py-2.5 text-sm font-bold shadow-lift',
              TONE[item.tone] ?? TONE.info,
            )}
          >
            {item.message}
          </div>
        ))}
      </div>

      {/* Diálogo de confirmación */}
      {confirmState && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-ink/50 p-5 backdrop-blur-sm animate-fade-in"
          onClick={() => closeConfirm(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm animate-pop-in rounded-3xl bg-white p-6 text-center shadow-lift"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-extrabold text-ink">{confirmState.title}</h3>
            {confirmState.message && (
              <p className="mt-2 text-sm text-ink-soft">{confirmState.message}</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="flex-1 rounded-full border-2 border-line px-4 py-3 font-bold text-ink-soft transition hover:bg-cream active:scale-95"
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className={cn(
                  'flex-1 rounded-full px-4 py-3 font-bold text-white transition active:scale-95',
                  confirmState.danger
                    ? 'bg-chili-500 hover:bg-chili-600'
                    : 'bg-brand-600 hover:bg-brand-700',
                )}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return context
}
