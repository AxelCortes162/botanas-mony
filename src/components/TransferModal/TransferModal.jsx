// src/components/TransferModal/TransferModal.jsx
import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ReceiptSender from './ReceiptSender'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../lib/format'

const STEPS = [
  'Haz la transferencia por el total de tu pedido',
  'Guarda o toma captura del comprobante',
  'Mándalo por WhatsApp con el botón de aquí abajo',
  '¡Listo! Empezamos a prepararlo',
]

const TransferModal = ({ payment, onClose }) => {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const copyClabe = async () => {
    try {
      await navigator.clipboard.writeText(payment.clabe)
      setCopied(true)
      toast('CLABE copiada 📋', 'success')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('No se pudo copiar, selecciónala manualmente', 'error')
    }
  }

  return (
    <Modal
      title="Datos de transferencia"
      icon="💳"
      size="md"
      onClose={onClose}
      footer={
        <Button variant="secondary" full onClick={onClose}>
          Entendido
        </Button>
      }
    >
      {/* Tarjeta */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 to-brand-800 p-5 text-white shadow-lift">
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-10 -left-6 size-28 rounded-full bg-white/10"
        />

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">Banco</p>
          <p className="font-display text-2xl font-extrabold">{payment.banco}</p>

          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-white/70">
            CLABE interbancaria
          </p>
          <p className="font-mono text-lg font-bold tracking-wider">{payment.clabe}</p>

          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-white/70">Titular</p>
          <p className="font-semibold">{payment.titular}</p>
        </div>
      </div>

      <Button
        variant="primary"
        full
        className={cn('mt-3', copied && 'bg-lima-600 shadow-none hover:bg-lima-600')}
        onClick={copyClabe}
      >
        {copied ? '✓ CLABE copiada' : '📋 Copiar CLABE'}
      </Button>

      {/* Instrucciones */}
      <section className="mt-5">
        <h3 className="mb-3 font-display text-base font-extrabold text-ink">📝 ¿Cómo pagar?</h3>
        <ol className="space-y-2.5">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-extrabold text-brand-700">
                {index + 1}
              </span>
              <span className="text-sm font-semibold leading-snug text-ink-soft">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <ReceiptSender payment={payment} />

      <div className="mt-4 flex gap-3 rounded-2xl border-2 border-brand-200 bg-brand-50 p-3">
        <span className="text-xl">⚠️</span>
        <p className="text-xs font-semibold leading-snug text-brand-900">
          Tu pedido se confirma en cuanto recibamos el comprobante de pago.
        </p>
      </div>
    </Modal>
  )
}

export default TransferModal
