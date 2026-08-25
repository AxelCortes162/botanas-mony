// src/components/AdminModal/StaleNotice.jsx

/** Aviso de que el dato cambió en el servidor mientras se editaba. */
const StaleNotice = ({ onDiscard }) => (
  <div className="mb-2 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2">
    <span className="text-base">⚠️</span>
    <p className="flex-1 text-[11px] font-semibold leading-snug text-brand-900">
      Esto cambió desde otro dispositivo. Si guardas, tu versión gana.
    </p>
    <button
      type="button"
      onClick={onDiscard}
      className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-brand-700 transition active:scale-95"
    >
      Ver la nueva
    </button>
  </div>
)

export default StaleNotice
