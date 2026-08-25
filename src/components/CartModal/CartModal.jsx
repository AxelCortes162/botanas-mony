// src/components/CartModal/CartModal.jsx
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import QuantityStepper from '../ui/QuantityStepper'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { money } from '../../lib/format'

const CartModal = ({ onClose, onContinue }) => {
  const { items, subtotal, count, isEmpty, increment, decrement, removeItem, clear } = useCart()
  const { confirm, toast } = useToast()

  const handleClear = async () => {
    const ok = await confirm({
      title: '¿Vaciar el carrito?',
      message: 'Se quitarán todos los productos de tu pedido.',
      confirmText: 'Sí, vaciar',
      danger: true,
    })
    if (ok) {
      clear()
      toast('Carrito vacío', 'info')
    }
  }

  return (
    <Modal
      title="Tu pedido"
      icon="🛒"
      size="md"
      onClose={onClose}
      footer={
        isEmpty ? (
          <Button variant="secondary" full onClick={onClose}>
            Seguir viendo el menú
          </Button>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-ink-soft">
                Subtotal · {count} {count === 1 ? 'producto' : 'productos'}
              </span>
              <span className="font-display text-2xl font-extrabold text-brand-700">
                {money(subtotal)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleClear} aria-label="Vaciar carrito">
                🗑️
              </Button>
              <Button variant="whatsapp" size="lg" className="flex-1" onClick={onContinue}>
                Continuar pedido
              </Button>
            </div>
          </>
        )
      }
    >
      {isEmpty ? (
        <div className="py-12 text-center">
          <span className="block animate-float text-6xl">🛒</span>
          <p className="mt-4 font-display text-lg font-extrabold text-ink">Tu carrito está vacío</p>
          <p className="mt-1 text-sm text-ink-soft">¡Agrega algo delicioso del menú!</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li
              key={item.lineId}
              className="rounded-2xl border border-line bg-white p-3 shadow-soft"
            >
              <div className="flex gap-3">
                <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-linear-to-br from-brand-100 to-brand-200">
                  {item.image ? (
                    <img src={item.image} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="font-display text-lg font-extrabold text-brand-700">
                      {item.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-sm font-extrabold leading-tight text-ink">
                      {item.name}
                      {item.size === 'mitad' && (
                        <span className="ml-1.5 rounded-full bg-cream-deep px-1.5 py-0.5 text-[10px] font-extrabold text-ink-soft">
                          Mitad
                        </span>
                      )}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeItem(item.lineId)}
                      aria-label={`Quitar ${item.name}`}
                      className="no-tap-highlight shrink-0 text-ink-faint transition hover:text-chili-500 active:scale-90"
                    >
                      ✕
                    </button>
                  </div>

                  {item.added?.length > 0 && (
                    <p className="mt-1 text-[11px] font-semibold leading-snug text-brand-700">
                      ➕ {item.added.join(', ')}
                    </p>
                  )}
                  {item.removed?.length > 0 && (
                    <p className="text-[11px] font-semibold leading-snug text-chili-600">
                      ➖ {item.removed.join(', ')}
                    </p>
                  )}
                  {item.note && (
                    <p className="mt-1 text-[11px] italic leading-snug text-ink-soft">
                      📝 {item.note}
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <QuantityStepper
                      size="sm"
                      value={item.qty}
                      label={item.name}
                      onIncrement={() => increment(item.lineId)}
                      onDecrement={() => decrement(item.lineId)}
                      min={0}
                    />
                    <span className="font-display text-base font-extrabold text-ink">
                      {money(item.unitPrice * item.qty)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}

export default CartModal
