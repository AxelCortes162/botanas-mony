// src/components/AdminModal/PricesTab.jsx
import { useState } from 'react'
import Button from '../ui/Button'
import StaleNotice from './StaleNotice'
import { useDraft } from '../../hooks/useDraft'
import { cn } from '../../lib/format'

const PricesTab = ({ products, onSave }) => {
  const { draft, update, markSaved, discard, dirty, stale } = useDraft(products)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const setField = (id, field, value) => {
    setError('')
    update((current) =>
      current.map((product) => (product.id === id ? { ...product, [field]: value } : product)),
    )
  }

  const save = async () => {
    // Un producto con mitad activada y precio 0 se vendería gratis
    const zeroPrice = draft.find((product) => !(product.price > 0))
    if (zeroPrice) {
      setError(`"${zeroPrice.name}" quedaría en $0. Ponle un precio.`)
      return
    }

    const invalidHalf = draft.find((product) => product.hasHalfOption && !(product.halfPrice > 0))
    if (invalidHalf) {
      setError(`Ponle precio a la mitad de "${invalidHalf.name}" o desactiva esa opción.`)
      return
    }

    setBusy(true)
    const result = await onSave(draft)
    setBusy(false)
    if (result?.ok !== false) markSaved()
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-ink-soft">
        Cambia precios y oculta lo que se acabó. Los clientes lo ven al instante.
      </p>

      {draft.map((product) => (
        <div
          key={product.id}
          className={cn(
            'rounded-2xl border-2 border-line bg-white p-3 transition',
            product.available === false && 'opacity-60',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-display text-sm font-extrabold text-ink">{product.name}</h4>
            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-bold text-ink-soft">
              <input
                type="checkbox"
                checked={product.available !== false}
                onChange={(event) => setField(product.id, 'available', event.target.checked)}
                className="size-4 accent-brand-600"
              />
              Disponible
            </label>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-xs font-bold text-ink-faint">
              Precio
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={product.price}
                onChange={(event) => setField(product.id, 'price', Number(event.target.value) || 0)}
                className="mt-1 w-full rounded-xl border-2 border-line bg-cream px-3 py-2 text-sm font-extrabold text-ink focus:border-brand-400 focus:outline-none"
              />
            </label>

            <label
              className={cn(
                'text-xs font-bold text-ink-faint',
                !product.hasHalfOption && 'opacity-40',
              )}
            >
              Precio ½
              <input
                type="number"
                min="0"
                inputMode="numeric"
                disabled={!product.hasHalfOption}
                value={product.halfPrice ?? 0}
                onChange={(event) =>
                  setField(product.id, 'halfPrice', Number(event.target.value) || 0)
                }
                className="mt-1 w-full rounded-xl border-2 border-line bg-cream px-3 py-2 text-sm font-extrabold text-ink focus:border-brand-400 focus:outline-none disabled:cursor-not-allowed"
              />
            </label>
          </div>

          <label className="mt-2 flex cursor-pointer items-center gap-1.5 text-xs font-bold text-ink-soft">
            <input
              type="checkbox"
              checked={Boolean(product.hasHalfOption)}
              onChange={(event) => setField(product.id, 'hasHalfOption', event.target.checked)}
              className="size-4 accent-brand-600"
            />
            Se puede pedir por mitad
          </label>
        </div>
      ))}

      <div className="sticky bottom-0 -mx-5 border-t border-line bg-cream px-5 py-3">
        {stale && <StaleNotice onDiscard={discard} />}
        {error && (
          <p className="mb-2 rounded-xl bg-chili-500/10 px-3 py-2 text-xs font-bold text-chili-600">
            {error}
          </p>
        )}
        <Button variant="primary" size="lg" full disabled={!dirty || busy} onClick={save}>
          {busy ? 'Guardando…' : dirty ? 'Guardar cambios' : 'Todo guardado'}
        </Button>
      </div>
    </div>
  )
}

export default PricesTab
