// src/components/TransferModal/ReceiptSender.jsx
import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import { useToast } from '../../context/ToastContext'
import { cn, money, prettyTime } from '../../lib/format'
import { readLastOrder } from '../../lib/lastOrder'
import {
  RECEIPT_ACCEPT,
  buildReceiptMessage,
  canShareFile,
  shareReceipt,
  validateReceipt,
} from '../../lib/receipt'
import { openWhatsApp, whatsAppUrl } from '../../lib/whatsapp'

const ReceiptSender = ({ payment }) => {
  const inputRef = useRef(null)
  const { toast } = useToast()

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [order] = useState(readLastOrder)

  // La vista previa se libera al cambiar de archivo o al cerrar: si no, el
  // navegador se queda con la imagen en memoria.
  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreview(null)
      return undefined
    }

    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const pickFile = (event) => {
    const chosen = event.target.files?.[0]
    event.target.value = '' // permite volver a elegir el mismo archivo

    if (!chosen) return

    const check = validateReceipt(chosen)
    if (!check.ok) {
      setFile(null)
      setError(check.error)
      return
    }

    setError('')
    setBlocked(false)
    setFile(chosen)
  }

  const message = buildReceiptMessage(order)
  const chatUrl = whatsAppUrl(payment.whatsapp, message)

  const openChatOnly = () => {
    const opened = openWhatsApp(payment.whatsapp, message)
    if (opened) {
      toast('Adjunta tu comprobante con el 📎 del chat', 'info', 4500)
      setBlocked(false)
    } else {
      // El navegador bloqueó la ventana: mejor mostrar un enlace que mentir
      setBlocked(true)
    }
  }

  const isSupported = file ? canShareFile(file) : true

  const send = async () => {
    if (!file) {
      inputRef.current?.click()
      return
    }

    // Si este navegador no puede mandar archivos, se abre el chat de una vez
    // dentro del mismo toque: pasar por el await gastaría el permiso para
    // abrir ventanas y quedaría bloqueado.
    if (!isSupported) {
      openChatOnly()
      return
    }

    setSending(true)
    const result = await shareReceipt(file, message)
    setSending(false)

    if (result.reason === 'cancelled') return

    if (result.ok) {
      // Compartir resolvió, pero eso solo significa que el archivo salió hacia
      // otra app: no hay forma de saber si de verdad se mandó el mensaje.
      toast('Listo, revisa que se haya enviado a Mony ✅', 'success', 4500)
      return
    }

    openChatOnly()
  }

  return (
    <section className="mt-5 rounded-2xl border-2 border-line bg-white p-4">
      <h3 className="font-display text-base font-extrabold text-ink">📸 Mandar mi comprobante</h3>
      <p className="mt-0.5 text-xs font-semibold text-ink-soft">
        {order
          ? `De tu pedido de ${money(order.total)}${
              order.time && order.time !== 'asap' ? ` para las ${prettyTime(order.time)}` : ''
            }.`
          : 'Toma o elige la captura de tu transferencia.'}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={RECEIPT_ACCEPT}
        onChange={pickFile}
        className="sr-only"
        aria-label="Elegir comprobante de pago"
      />

      {/* Zona de selección / vista previa */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'no-tap-highlight mt-3 flex w-full items-center gap-3 rounded-2xl border-2 border-dashed p-3 text-left transition active:scale-[0.99]',
          file ? 'border-lima-500 bg-lima-500/5' : 'border-line bg-cream hover:border-brand-300',
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Vista previa del comprobante"
            className="size-14 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-50 text-2xl">
            {/* Se mira el tipo, no si hay archivo: al elegir una foto la vista
                previa tarda un render y aparecería el icono de PDF un instante */}
            {file?.type === 'application/pdf' ? '📄' : '📷'}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-ink">
            {file ? file.name : 'Elegir foto o PDF'}
          </span>
          <span className="block truncate text-[11px] font-semibold text-ink-faint">
            {file
              ? `${(file.size / 1024 / 1024).toFixed(1)} MB · toca para cambiarla`
              : 'Desde tu galería o con la cámara'}
          </span>
        </span>
      </button>

      {error && (
        <p className="mt-2 rounded-xl bg-chili-500/10 px-3 py-2 text-xs font-bold text-chili-600">
          {error}
        </p>
      )}

      <Button variant="whatsapp" size="lg" full className="mt-3" disabled={sending} onClick={send}>
        {sending
          ? 'Abriendo…'
          : !file
            ? '📎 Elegir comprobante'
            : isSupported
              ? '💬 Enviar por WhatsApp'
              : '💬 Abrir el chat de WhatsApp'}
      </Button>

      <p className="mt-2 text-[11px] font-semibold text-ink-faint">
        {file && !isSupported
          ? 'Tu navegador no puede mandar archivos directo: se abre el chat y adjuntas la foto con el 📎.'
          : 'Se abre el menú de compartir de tu celular: elige WhatsApp y luego el chat de Botanas Mony.'}
      </p>

      {blocked ? (
        <a
          href={chatUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setBlocked(false)}
          className="mt-2 block rounded-xl bg-brand-50 px-3 py-2 text-center text-xs font-extrabold text-brand-900"
        >
          Tu navegador bloqueó la ventana · toca aquí para abrir el chat
        </a>
      ) : (
        <button
          type="button"
          onClick={openChatOnly}
          className="mt-2 w-full text-center text-xs font-extrabold text-ink-faint underline underline-offset-2 transition hover:text-brand-700"
        >
          O solo abrir el chat y adjuntarla yo
        </button>
      )}
    </section>
  )
}

export default ReceiptSender
