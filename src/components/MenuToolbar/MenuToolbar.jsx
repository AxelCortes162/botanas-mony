// src/components/MenuToolbar/MenuToolbar.jsx
import { cn } from '../../lib/format'

/** Buscador + filtro por categoría, pegado bajo el encabezado. */
const MenuToolbar = ({ query, onQueryChange, categories, activeCategory, onCategoryChange }) => (
  <div className="sticky top-0 z-40 border-b border-line bg-cream-deep/95 px-4 pb-3 pt-3 backdrop-blur-md">
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
        🔍
      </span>
      <input
        type="search"
        inputMode="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Busca una botana o un ingrediente…"
        aria-label="Buscar productos"
        className="w-full rounded-full border-2 border-line bg-white py-3 pl-11 pr-4 text-sm font-semibold text-ink placeholder:font-medium placeholder:text-ink-faint focus:border-brand-400 focus:outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-cream-deep text-ink-soft transition hover:bg-brand-100 active:scale-90"
        >
          ×
        </button>
      )}
    </div>

    {categories.length > 1 && (
      <div className="scrollbar-slim -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {['Todo', ...categories].map((category) => {
          const isActive = activeCategory === category
          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              aria-pressed={isActive}
              className={cn(
                'no-tap-highlight shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-extrabold transition active:scale-95',
                isActive
                  ? 'border-brand-600 bg-brand-600 text-white shadow-glow'
                  : 'border-line bg-white text-ink-soft hover:border-brand-300 hover:text-brand-700',
              )}
            >
              {category}
            </button>
          )
        })}
      </div>
    )}
  </div>
)

export default MenuToolbar
