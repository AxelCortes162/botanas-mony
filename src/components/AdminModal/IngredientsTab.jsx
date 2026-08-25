// src/components/AdminModal/IngredientsTab.jsx
import { useState } from 'react'
import Button from '../ui/Button'
import StaleNotice from './StaleNotice'
import { useDraft } from '../../hooks/useDraft'
import { ingredientGroups } from '../../data/products'
import { cn } from '../../lib/format'

/**
 * Dos cosas se manejan aquí:
 *  1. Qué ingredientes hay hoy en el puesto (los que no estén, no se ofrecen).
 *  2. Qué lleva de fábrica cada producto personalizable.
 */
const IngredientsTab = ({ products, ingredients, onSaveIngredients, onSaveProducts }) => {
  const stock = useDraft(ingredients)
  const recipes = useDraft(products)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)

  const toggleStock = (ingredient) => {
    stock.update((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient],
    )
  }

  const toggleBase = (productId, ingredient) => {
    recipes.update((current) =>
      current.map((product) => {
        if (product.id !== productId) return product
        const base = product.baseIngredients ?? []
        return {
          ...product,
          baseIngredients: base.includes(ingredient)
            ? base.filter((item) => item !== ingredient)
            : [...base, ingredient],
        }
      }),
    )
  }

  const save = async () => {
    setBusy(true)

    if (stock.dirty) {
      const result = await onSaveIngredients(stock.draft)
      if (result?.ok !== false) stock.markSaved()
    }
    if (recipes.dirty) {
      const result = await onSaveProducts(recipes.draft)
      if (result?.ok !== false) recipes.markSaved()
    }

    setBusy(false)
  }

  const editingProduct = recipes.draft.find((product) => product.id === editing)
  const dirty = stock.dirty || recipes.dirty

  return (
    <div className="space-y-5">
      {/* Existencias */}
      <section>
        <h4 className="font-display text-base font-extrabold text-ink">🧺 Qué hay hoy</h4>
        <p className="mb-2 text-xs font-semibold text-ink-soft">
          Desmarca lo que se te acabó: deja de aparecer al personalizar.
        </p>

        <div className="space-y-2.5">
          {Object.entries(ingredientGroups).map(([group, list]) => (
            <div key={group}>
              <p className="mb-1 text-xs font-extrabold text-ink-soft">{group}</p>
              <div className="flex flex-wrap gap-1.5">
                {list.map((ingredient) => {
                  const isActive = stock.draft.includes(ingredient)
                  return (
                    <button
                      key={ingredient}
                      type="button"
                      onClick={() => toggleStock(ingredient)}
                      className={cn(
                        'no-tap-highlight rounded-full border-2 px-3 py-1 text-xs font-extrabold transition active:scale-95',
                        isActive
                          ? 'border-lima-500 bg-lima-500/10 text-lima-600'
                          : 'border-line bg-white text-ink-faint line-through',
                      )}
                    >
                      {ingredient}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ingredientes base por producto */}
      <section>
        <h4 className="font-display text-base font-extrabold text-ink">
          🍽️ Receta de cada producto
        </h4>
        <p className="mb-2 text-xs font-semibold text-ink-soft">
          Lo que lleva incluido sin costo extra.
        </p>

        <div className="space-y-1.5">
          {recipes.draft
            .filter((product) => product.customizable)
            .map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setEditing(editing === product.id ? null : product.id)}
                className="flex w-full items-center justify-between rounded-2xl border-2 border-line bg-white px-3 py-2.5 text-left transition hover:border-brand-300"
              >
                <span className="min-w-0">
                  <span className="block font-display text-sm font-extrabold text-ink">
                    {product.name}
                  </span>
                  <span className="block truncate text-[11px] text-ink-faint">
                    {(product.baseIngredients ?? []).length} ingredientes
                  </span>
                </span>
                <span className="shrink-0 text-ink-faint">
                  {editing === product.id ? '▲' : '▼'}
                </span>
              </button>
            ))}
        </div>

        {editingProduct && (
          <div className="mt-2 animate-pop-in rounded-2xl border-2 border-brand-200 bg-brand-50 p-3">
            <p className="mb-2 text-xs font-extrabold text-brand-900">
              Receta de {editingProduct.name}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {stock.draft.map((ingredient) => {
                const isBase = (editingProduct.baseIngredients ?? []).includes(ingredient)
                return (
                  <button
                    key={ingredient}
                    type="button"
                    onClick={() => toggleBase(editingProduct.id, ingredient)}
                    className={cn(
                      'no-tap-highlight rounded-full border-2 px-3 py-1 text-xs font-extrabold transition active:scale-95',
                      isBase
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-line bg-white text-ink-soft',
                    )}
                  >
                    {ingredient}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </section>

      <div className="sticky bottom-0 -mx-5 border-t border-line bg-cream px-5 py-3">
        {(stock.stale || recipes.stale) && (
          <StaleNotice
            onDiscard={() => {
              stock.discard()
              recipes.discard()
            }}
          />
        )}
        <Button variant="primary" size="lg" full disabled={busy || !dirty} onClick={save}>
          {busy ? 'Guardando…' : dirty ? 'Guardar cambios' : 'Todo guardado'}
        </Button>
      </div>
    </div>
  )
}

export default IngredientsTab
