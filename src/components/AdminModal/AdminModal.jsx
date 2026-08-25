// src/components/AdminModal/AdminModal.jsx
import { useState } from 'react'
import Modal from '../ui/Modal'
import LoginForm from './LoginForm'
import StatusTab from './StatusTab'
import PricesTab from './PricesTab'
import IngredientsTab from './IngredientsTab'
import DeliveryTab from './DeliveryTab'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../lib/format'

const TABS = [
  { key: 'status', icon: '🏪', label: 'Tienda' },
  { key: 'prices', icon: '💰', label: 'Precios' },
  { key: 'ingredients', icon: '🥗', label: 'Ingredientes' },
  { key: 'delivery', icon: '🚚', label: 'Entrega' },
]

const AdminModal = ({ onClose }) => {
  const store = useStore()
  const { toast } = useToast()
  const [tab, setTab] = useState('status')

  // Envuelve cada guardado para avisar si el servidor lo rechazó
  const report = async (promise, successMessage) => {
    const result = await promise
    if (result?.ok === false) {
      toast(result.error ?? 'No se pudo guardar', 'error', 4000)
    } else {
      toast(successMessage, 'success')
    }
    return result
  }

  return (
    <Modal title="Administración" icon="⚙️" size="lg" onClose={onClose}>
      {!store.isAdmin ? (
        <LoginForm onSignIn={store.signIn} />
      ) : (
        <>
          <div className="scrollbar-slim -mx-5 mb-4 flex gap-1.5 overflow-x-auto px-5 pb-1">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={cn(
                  'no-tap-highlight shrink-0 rounded-full px-3.5 py-2 text-sm font-extrabold transition active:scale-95',
                  tab === item.key
                    ? 'bg-brand-600 text-white shadow-glow'
                    : 'bg-white text-ink-soft hover:bg-brand-50',
                )}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'status' && (
            <StatusTab
              schedule={store.schedule}
              scheduleLabel={store.scheduleLabel}
              settings={store.deliverySettings}
              isOnline={store.isOnline}
              adminEmail={store.adminUser?.email ?? ''}
              onSetOpenToday={(isOpen) =>
                report(
                  store.setOpenToday(isOpen),
                  isOpen ? 'Tienda abierta por hoy' : 'Tienda cerrada por hoy',
                )
              }
              onSetPickupToday={(value) =>
                report(
                  store.setPickupToday(value),
                  value ? 'Recoger activado hoy' : 'Recoger desactivado hoy',
                )
              }
              onSetDeliveryToday={(value) =>
                report(
                  store.setDeliveryToday(value),
                  value ? 'Envío activado hoy' : 'Envío desactivado hoy',
                )
              }
              onClearAdjustment={() =>
                report(store.clearDayAdjustment(), 'Listo, manda el horario automático')
              }
              onSignOut={() => report(store.signOut(), 'Sesión cerrada')}
            />
          )}

          {tab === 'prices' && (
            <PricesTab
              products={store.products}
              onSave={(list) => report(store.updateProducts(list), 'Precios actualizados')}
            />
          )}

          {tab === 'ingredients' && (
            <IngredientsTab
              products={store.products}
              ingredients={store.ingredients}
              onSaveIngredients={(list) =>
                report(store.updateIngredients(list), 'Ingredientes actualizados')
              }
              onSaveProducts={(list) => report(store.updateProducts(list), 'Recetas actualizadas')}
            />
          )}

          {tab === 'delivery' && (
            <DeliveryTab
              settings={store.deliverySettings}
              onSave={(config) =>
                report(store.updateDeliverySettings(config), 'Configuración guardada')
              }
            />
          )}
        </>
      )}
    </Modal>
  )
}

export default AdminModal
