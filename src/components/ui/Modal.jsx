// src/components/ui/Modal.jsx
import { useEffect } from 'react'
import { cn } from '../../lib/format'

/**
 * Hoja modal reutilizable: sube desde abajo en móvil, se centra en escritorio,
 * cierra con Escape o tocando fuera y bloquea el scroll del fondo.
 */
const Modal = ({ title, icon, onClose, children, footer, size = 'md' }) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-ink/55 backdrop-blur-sm animate-fade-in sm:items-center sm:p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream shadow-lift animate-slide-up sm:rounded-3xl',
          size === 'sm' && 'sm:max-w-sm',
          size === 'md' && 'sm:max-w-md',
          size === 'lg' && 'sm:max-w-xl',
        )}
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-line bg-white px-5 py-4">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="flex-1 text-lg font-extrabold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="no-tap-highlight grid size-9 place-items-center rounded-full bg-cream-deep text-xl leading-none text-ink-soft transition hover:bg-brand-100 hover:text-brand-700 active:scale-90"
          >
            ×
          </button>
        </header>

        <div className="scrollbar-slim flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>

        {footer && (
          <footer className="shrink-0 border-t border-line bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}

export default Modal
