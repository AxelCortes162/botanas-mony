// src/components/Header/Header.jsx
import { cn } from '../../lib/format'

const Header = ({ isStoreOpen, isOnline, scheduleLabel }) => (
  <header className="relative overflow-hidden bg-linear-to-b from-brand-500 to-brand-600 px-5 pb-5 pt-[max(0.75rem,env(safe-area-inset-top))] text-center">
    {/* Textura de fondo sutil */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-20"
      style={{
        backgroundImage:
          'radial-gradient(circle at 20% 20%, white 1.5px, transparent 1.5px), radial-gradient(circle at 70% 60%, white 1.5px, transparent 1.5px)',
        backgroundSize: '42px 42px, 58px 58px',
      }}
    />

    <div className="relative">
      {/* logo-header.svg es logolargo.svg recortado a su dibujo real: el
          original tiene el lienzo cuadrado y el logo ocupaba solo la cuarta
          parte de la altura, así que se veía diminuto por más que creciera
          la caja. Con el recorte basta poca altura para que se lea grande. */}
      <img
        src="/logo-header.svg"
        alt="Botanas Mony"
        onError={(event) => {
          // Si el recortado no está, se cae al original
          if (!event.currentTarget.dataset.fallback) {
            event.currentTarget.dataset.fallback = 'true'
            event.currentTarget.src = '/logolargo.svg'
          }
        }}
        className="mx-auto h-20 w-auto max-w-full object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.22)] sm:h-24"
      />

      <p className="mt-1.5 font-display text-lg font-semibold text-white/95">
        ¡Antójate y pide tus favoritas!
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold',
            isStoreOpen ? 'bg-white/95 text-lima-600' : 'bg-ink/70 text-white',
          )}
        >
          <span
            className={cn(
              'size-2 rounded-full',
              isStoreOpen ? 'animate-pulse bg-lima-500' : 'bg-white/70',
            )}
          />
          {scheduleLabel ?? (isStoreOpen ? 'Abierto ahora' : 'Cerrado')}
        </span>

        {!isOnline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
            📡 Sin conexión
          </span>
        )}
      </div>
    </div>
  </header>
)

export default Header
