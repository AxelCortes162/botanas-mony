// src/components/ui/QuantityStepper.jsx
import { cn } from '../../lib/format'

const QuantityStepper = ({ value, onIncrement, onDecrement, min = 1, size = 'md', label }) => {
  const compact = size === 'sm'

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border-2 border-line bg-white',
        compact ? 'gap-0.5 p-0.5' : 'gap-1 p-1',
      )}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={value <= min}
        aria-label={`Quitar uno${label ? ` de ${label}` : ''}`}
        className={cn(
          'no-tap-highlight grid place-items-center rounded-full font-extrabold text-brand-700 transition',
          'hover:bg-brand-50 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent',
          compact ? 'size-7 text-base' : 'size-9 text-lg',
        )}
      >
        −
      </button>

      <span
        aria-live="polite"
        className={cn(
          'text-center font-extrabold tabular-nums text-ink',
          compact ? 'min-w-5 text-sm' : 'min-w-7',
        )}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        aria-label={`Agregar uno${label ? ` de ${label}` : ''}`}
        className={cn(
          'no-tap-highlight grid place-items-center rounded-full font-extrabold text-brand-700 transition',
          'hover:bg-brand-50 active:scale-90',
          compact ? 'size-7 text-base' : 'size-9 text-lg',
        )}
      >
        +
      </button>
    </div>
  )
}

export default QuantityStepper
