// src/components/FloatingBar/FloatingBar.jsx
import { useCart } from '../../context/CartContext'
import { cn, money } from '../../lib/format'

/**
 * Con la tienda cerrada sigue apareciendo el botón de transferencia: el
 * cliente suele pagar y mandar su comprobante un rato DESPUÉS de pedir, y
 * si la barra desaparece al cerrar el puesto se queda sin forma de hacerlo.
 */
const FloatingBar = ({ isStoreOpen, onOpenTransfer, onOpenCart }) => {
  const { count, subtotal, isEmpty } = useCart()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex w-full max-w-lg gap-2">
        <button
          type="button"
          onClick={onOpenTransfer}
          className={cn(
            'no-tap-highlight flex items-center justify-center gap-2 rounded-full px-5 py-3.5 font-extrabold shadow-lift transition hover:-translate-y-0.5 active:scale-95',
            isStoreOpen ? 'bg-white text-ink' : 'flex-1 bg-white text-ink',
          )}
        >
          <span className="text-lg">💳</span>
          <span className={cn('text-sm', isStoreOpen ? 'hidden sm:inline' : 'inline')}>
            {isStoreOpen ? 'Transferencia' : 'Pagar o mandar comprobante'}
          </span>
        </button>

        {isStoreOpen && (
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Ver carrito, ${count} productos`}
            className="no-tap-highlight relative flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-r from-brand-500 to-brand-600 px-5 py-3.5 font-extrabold text-white shadow-glow transition hover:-translate-y-0.5 active:scale-95"
          >
            <span className="text-lg">🛒</span>
            <span className="text-sm">
              {isEmpty ? 'Tu carrito' : `Ver pedido · ${money(subtotal)}`}
            </span>

            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-6 place-items-center rounded-full border-2 border-white bg-chili-500 px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums text-white">
                {count}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default FloatingBar
