// src/components/IngredientModal/IngredientModal.jsx
import { useEffect, useMemo, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import QuantityStepper from '../ui/QuantityStepper'
import { EXTRA_INGREDIENT_COST, ingredientGroups } from '../../data/products'
import { cn, money } from '../../lib/format'

const IngredientModal = ({ product, availableIngredients, onClose, onConfirm }) => {
  // La receta base se congela al abrir el modal. Si cambiara a mitad del
  // pedido (porque el admin marca algo como agotado), lo que el cliente ya
  // tenía elegido pasaría a contar como "extra" y el precio subiría solo.
  const [base] = useState(() =>
    (product?.baseIngredients ?? []).filter((item) => availableIngredients.includes(item)),
  )

  const [selected, setSelected] = useState(() => [...base])
  const [size, setSize] = useState('entero')
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')

  // Si el admin marca algo como agotado con el modal abierto, ese ingrediente
  // sale también de la selección: si no, dejaría de contar como base y se
  // cobraría como extra sin que el cliente tocara nada.
  useEffect(() => {
    setSelected((current) => current.filter((item) => availableIngredients.includes(item)))
  }, [availableIngredients])

  const toggle = (ingredient) => {
    setSelected((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient],
    )
  }

  const added = selected.filter((item) => !base.includes(item))
  const removed = base.filter((item) => !selected.includes(item))

  // Intercambiar 1 a 1 no cuesta: solo se cobra lo que sobra
  const netExtras = Math.max(0, added.length - removed.length)
  const basePrice = size === 'mitad' && product.hasHalfOption ? product.halfPrice : product.price
  const extraCharge = netExtras * EXTRA_INGREDIENT_COST
  const unitPrice = basePrice + extraCharge

  // Solo se muestran los ingredientes que el admin tiene activos
  const groups = useMemo(() => {
    const active = new Set(availableIngredients)
    return Object.entries(ingredientGroups)
      .map(([group, list]) => [group, list.filter((item) => active.has(item))])
      .filter(([, list]) => list.length > 0)
  }, [availableIngredients])

  const handleConfirm = () => {
    onConfirm(
      {
        productId: product.id,
        name: product.name,
        image: product.image,
        size,
        unitPrice,
        ingredients: selected,
        added,
        removed,
        note: note.trim(),
      },
      qty,
    )
  }

  return (
    <Modal
      title={`Personaliza tu ${product.name}`}
      icon="🎨"
      size="lg"
      onClose={onClose}
      footer={
        <div className="flex items-center gap-3">
          <QuantityStepper
            value={qty}
            onIncrement={() => setQty((q) => q + 1)}
            onDecrement={() => setQty((q) => Math.max(1, q - 1))}
            label={product.name}
          />
          <Button variant="primary" size="lg" className="flex-1" onClick={handleConfirm}>
            Añadir · {money(unitPrice * qty)}
          </Button>
        </div>
      }
    >
      {/* Tamaño */}
      {product.hasHalfOption && (
        <section className="mb-4">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink-faint">
            📏 Tamaño
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'entero', label: 'Entero', price: product.price },
              { key: 'mitad', label: 'Mitad', price: product.halfPrice },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSize(option.key)}
                className={cn(
                  'no-tap-highlight rounded-2xl border-2 px-4 py-3 text-center transition active:scale-95',
                  size === option.key
                    ? 'border-brand-600 bg-brand-50 text-brand-800'
                    : 'border-line bg-white text-ink-soft hover:border-brand-300',
                )}
              >
                <span className="block font-display text-base font-extrabold">{option.label}</span>
                <span className="text-sm font-bold">{money(option.price)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Ingredientes */}
      <section>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink-faint">
            🥗 Ingredientes
          </p>
          <p className="text-xs font-bold text-ink-soft">
            {netExtras > 0
              ? `${netExtras} extra${netExtras > 1 ? 's' : ''} · +${money(extraCharge)}`
              : `Intercambia 1 × 1 sin costo · extra ${money(EXTRA_INGREDIENT_COST)}`}
          </p>
        </div>

        <div className="space-y-3">
          {groups.map(([group, list]) => (
            <div key={group}>
              <h4 className="mb-1.5 text-sm font-extrabold text-ink">{group}</h4>
              <div className="grid grid-cols-2 gap-1.5">
                {list.map((ingredient) => {
                  const isBase = base.includes(ingredient)
                  const isSelected = selected.includes(ingredient)
                  const isExtra = isSelected && !isBase

                  return (
                    <label
                      key={ingredient}
                      className={cn(
                        'no-tap-highlight flex cursor-pointer items-center gap-2 rounded-xl border-2 px-2.5 py-2 text-sm font-semibold transition',
                        isSelected
                          ? isExtra
                            ? 'border-brand-500 bg-brand-50 text-brand-800'
                            : 'border-lima-500 bg-lima-500/10 text-ink'
                          : 'border-line bg-white text-ink-soft hover:border-brand-200',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(ingredient)}
                        className="size-4 shrink-0 accent-brand-600"
                      />
                      <span className="min-w-0 flex-1 truncate">{ingredient}</span>
                      {isExtra && (
                        <span className="shrink-0 text-[10px] font-extrabold text-brand-600">
                          +{money(EXTRA_INGREDIENT_COST)}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nota */}
      <section className="mt-4">
        <label
          htmlFor="item-note"
          className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-ink-faint"
        >
          📝 Nota para Mony (opcional)
        </label>
        <input
          id="item-note"
          type="text"
          value={note}
          maxLength={120}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ej. poquito chile, sin sal, extra limón…"
          className="w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm font-semibold text-ink placeholder:font-medium placeholder:text-ink-faint focus:border-brand-400 focus:outline-none"
        />
      </section>

      {/* Resumen */}
      <section className="mt-4 rounded-2xl border border-line bg-white p-4">
        <div className="flex justify-between text-sm font-semibold text-ink-soft">
          <span>Precio base{size === 'mitad' ? ' (mitad)' : ''}</span>
          <span>{money(basePrice)}</span>
        </div>

        {added.length > 0 && (
          <p className="mt-2 text-xs font-semibold text-brand-700">➕ {added.join(', ')}</p>
        )}
        {removed.length > 0 && (
          <p className="mt-1 text-xs font-semibold text-chili-600">➖ {removed.join(', ')}</p>
        )}

        {netExtras > 0 && (
          <div className="mt-2 flex justify-between text-sm font-semibold text-ink-soft">
            <span>
              Extras ({netExtras} × {money(EXTRA_INGREDIENT_COST)})
            </span>
            <span>+{money(extraCharge)}</span>
          </div>
        )}

        {netExtras === 0 && added.length > 0 && removed.length > 0 && (
          <p className="mt-2 text-xs font-extrabold text-lima-600">✨ ¡Intercambio sin costo!</p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="font-display text-base font-extrabold text-ink">
            Total {qty > 1 && <span className="text-sm text-ink-soft">({qty} piezas)</span>}
          </span>
          <span className="font-display text-2xl font-extrabold text-brand-700">
            {money(unitPrice * qty)}
          </span>
        </div>
      </section>
    </Modal>
  )
}

export default IngredientModal
