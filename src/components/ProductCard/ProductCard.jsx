// src/components/ProductCard/ProductCard.jsx
import { useState } from 'react'
import { cn, money } from '../../lib/format'

const ProductCard = ({ product, onAddClick, disabled }) => {
  const [imageError, setImageError] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  const hasImage = Boolean(product.image) && !imageError

  return (
    <>
      <article
        className={cn(
          'group flex gap-3 rounded-card border border-line bg-white p-3 shadow-soft transition duration-300',
          disabled ? 'opacity-60 saturate-50' : 'hover:-translate-y-0.5 hover:shadow-lift',
        )}
      >
        <button
          type="button"
          onClick={() => hasImage && setIsZoomed(true)}
          disabled={!hasImage}
          aria-label={hasImage ? `Ver foto de ${product.name}` : product.name}
          className={cn(
            'no-tap-highlight relative size-24 shrink-0 overflow-hidden rounded-2xl bg-linear-to-br from-brand-100 to-brand-200',
            hasImage ? 'cursor-zoom-in' : 'cursor-default',
          )}
        >
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="size-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="grid size-full place-items-center font-display text-3xl font-extrabold text-brand-700">
              {product.name.charAt(0)}
            </span>
          )}

          {product.hasHalfOption && (
            <span className="absolute bottom-1 left-1 rounded-full bg-ink/75 px-2 py-0.5 text-[10px] font-extrabold text-white">
              ½ disponible
            </span>
          )}
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="font-display text-base font-extrabold leading-tight text-ink">
            {product.name}
          </h3>

          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-soft">
            {product.description}
          </p>

          {product.customizable && (
            <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand-700">
              ✨ Personalizable
            </span>
          )}

          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div className="leading-none">
              <span className="font-display text-xl font-extrabold text-brand-700">
                {money(product.price)}
              </span>
              {product.hasHalfOption && product.halfPrice > 0 && (
                <span className="ml-1 text-[11px] font-bold text-ink-faint">
                  ½ {money(product.halfPrice)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onAddClick(product)}
              disabled={disabled}
              className={cn(
                'no-tap-highlight shrink-0 rounded-full px-4 py-2.5 text-sm font-extrabold transition active:scale-95',
                disabled
                  ? 'cursor-not-allowed bg-cream-deep text-ink-faint'
                  : 'bg-brand-600 text-white shadow-glow hover:bg-brand-700',
              )}
            >
              {disabled ? '🔒 Cerrado' : product.customizable ? 'Personalizar' : 'Añadir'}
            </button>
          </div>
        </div>
      </article>

      {isZoomed && (
        <div
          className="fixed inset-0 z-[150] grid place-items-center bg-ink/85 p-6 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsZoomed(false)}
          role="presentation"
        >
          <div className="w-full max-w-md animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-3xl object-contain shadow-lift"
            />
            <p className="mt-3 text-center font-display text-lg font-extrabold text-white">
              {product.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsZoomed(false)}
            aria-label="Cerrar imagen"
            className="absolute right-5 top-[max(1.25rem,env(safe-area-inset-top))] grid size-10 place-items-center rounded-full bg-white/20 text-xl text-white backdrop-blur transition hover:bg-white/30 active:scale-90"
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}

export default ProductCard
