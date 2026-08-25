// src/components/MenuQR.jsx
import { QRCodeSVG } from 'qrcode.react'

/**
 * QR para imprimir y pegar en el puesto.
 * No está montado en la app: se usa cuando se quiere generar el letrero.
 */
const MenuQR = ({ url = 'https://botanasmony.vercel.app/' }) => (
  <div className="mx-auto w-fit rounded-3xl bg-white p-6 text-center shadow-lift">
    <p className="font-display text-lg font-extrabold text-ink">¡Escanea para ver el menú!</p>
    <div className="mt-3">
      <QRCodeSVG value={url} size={200} fgColor="#ff6b00" level="H" marginSize={2} />
    </div>
    <p className="mt-3 font-display text-sm font-extrabold text-brand-700">Botanas Mony</p>
  </div>
)

export default MenuQR
