// src/App.jsx
import { useMemo, useState } from 'react'

import Header from './components/Header/Header'
import MenuToolbar from './components/MenuToolbar/MenuToolbar'
import ProductCard from './components/ProductCard/ProductCard'
import FloatingBar from './components/FloatingBar/FloatingBar'
import IngredientModal from './components/IngredientModal/IngredientModal'
import CartModal from './components/CartModal/CartModal'
import DeliveryModal from './components/DeliveryModal/DeliveryModal'
import TransferModal from './components/TransferModal/TransferModal'
import AdminModal from './components/AdminModal/AdminModal'
import InstallCard from './components/PwaPrompts/InstallCard'

import { useStore } from './context/StoreContext'
import { useCart } from './context/CartContext'
import { useToast } from './context/ToastContext'
import { normalize } from './lib/format'
import { buildOrderMessage, openWhatsApp } from './lib/whatsapp'
import { saveLastOrder } from './lib/lastOrder'

function App() {
  const store = useStore()
  const cart = useCart()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todo')
  const [activeProduct, setActiveProduct] = useState(null)
  const [modal, setModal] = useState(null) // 'cart' | 'delivery' | 'transfer' | 'admin'

  const visibleProducts = useMemo(() => {
    const needle = normalize(query.trim())

    return store.products
      .filter((product) => product.available !== false)
      .filter((product) => category === 'Todo' || product.category === category)
      .filter((product) => {
        if (!needle) return true
        const haystack = normalize(
          [product.name, product.description, ...(product.baseIngredients ?? [])].join(' '),
        )
        return haystack.includes(needle)
      })
  }, [store.products, category, query])

  /* ------------------------------- Acciones ------------------------------- */

  const handleAddClick = (product) => {
    if (!store.isStoreOpen) {
      toast(`🛑 Cerrado ahorita · ${store.scheduleLabel}`, 'warning', 3600)
      return
    }

    if (product.customizable) {
      setActiveProduct(product)
      return
    }

    cart.addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      size: 'entero',
      unitPrice: product.price,
      ingredients: [],
      added: [],
      removed: [],
      note: '',
    })
    toast(`${product.name} agregado 🛒`)
  }

  const handleConfirmCustom = (item, qty) => {
    cart.addItem(item, qty)
    setActiveProduct(null)
    toast(`${item.name} agregado 🛒`)
  }

  const handleSendOrder = (delivery) => {
    // El reloj pudo cerrar la tienda con el modal ya abierto
    if (!store.isStoreOpen) {
      setModal(null)
      toast(`🛑 Acabamos de cerrar · ${store.scheduleLabel}`, 'warning', 4000)
      return
    }

    const message = buildOrderMessage({
      items: cart.items,
      subtotal: cart.subtotal,
      delivery,
      payment: store.payment,
    })

    const opened = openWhatsApp(store.payment.whatsapp, message)

    // Si el navegador bloqueó la ventana, el pedido NO salió: vaciar el
    // carrito aquí le borraría al cliente todo lo que armó.
    if (!opened) {
      toast('Tu navegador bloqueó WhatsApp. Permite las ventanas e inténtalo de nuevo.', 'error', 6000)
      return
    }

    // Se recuerda de qué pedido es, para que el comprobante que mande
    // después pueda citarlo en vez de llegar suelto.
    saveLastOrder({
      total: delivery.finalTotal,
      customerName: delivery.customerName,
      time: delivery.time,
      method: delivery.method,
    })

    setModal(null)
    cart.clear()
    toast('¡Pedido enviado! Al pagar, manda tu comprobante con 💳', 'success', 5000)
  }

  /* -------------------------------- Carga --------------------------------- */

  if (store.loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-cream-deep px-6 text-center">
        <div>
          <span className="block animate-float text-6xl">🍿</span>
          <p className="mt-5 font-display text-xl font-extrabold text-ink">Botanas Mony</p>
          <p className="mt-1 text-sm text-ink-soft">Preparando el menú…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-cream-deep shadow-soft">
      <Header
        isStoreOpen={store.isStoreOpen}
        isOnline={store.isOnline}
        scheduleLabel={store.scheduleLabel}
      />

      <button
        type="button"
        onClick={() => setModal('admin')}
        title="Administración"
        aria-label="Abrir panel de administración"
        className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 grid size-9 place-items-center rounded-full bg-white/20 text-base text-white backdrop-blur transition hover:bg-white/35 active:scale-90"
      >
        ⚙️
      </button>

      {!store.isStoreOpen && (
        <div className="mx-4 mt-4 rounded-2xl bg-linear-to-br from-chili-500 to-chili-600 p-5 text-center text-white shadow-lift">
          <span className="text-3xl">😴</span>
          <p className="mt-1 font-display text-lg font-extrabold">{store.scheduleLabel}</p>
          <p className="text-sm text-white/85">
            Puedes ver el menú y antojarte; los pedidos se abren en cuanto encendamos el puesto.
          </p>
        </div>
      )}

      <InstallCard />

      <MenuToolbar
        query={query}
        onQueryChange={setQuery}
        categories={store.categories}
        activeCategory={category}
        onCategoryChange={setCategory}
      />

      <main className="flex-1 space-y-2.5 px-4 pb-28 pt-3">
        {visibleProducts.length > 0 ? (
          visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddClick={handleAddClick}
              disabled={!store.isStoreOpen}
            />
          ))
        ) : (
          <div className="py-16 text-center">
            <span className="block text-5xl">🔍</span>
            <p className="mt-3 font-display text-lg font-extrabold text-ink">Nada por aquí</p>
            <p className="mt-1 text-sm text-ink-soft">Prueba con otra búsqueda o categoría.</p>
          </div>
        )}
      </main>

      <FloatingBar
        isStoreOpen={store.isStoreOpen}
        onOpenTransfer={() => setModal('transfer')}
        onOpenCart={() => setModal('cart')}
      />

      {activeProduct && (
        <IngredientModal
          key={activeProduct.id}
          product={activeProduct}
          availableIngredients={store.ingredients}
          onClose={() => setActiveProduct(null)}
          onConfirm={handleConfirmCustom}
        />
      )}

      {modal === 'cart' && (
        <CartModal
          onClose={() => setModal(null)}
          onContinue={() => {
            if (cart.isEmpty) {
              toast('Agrega algo antes de continuar 🙂', 'info')
              return
            }
            if (!store.isStoreOpen) {
              setModal(null)
              toast(`🛑 Acabamos de cerrar · ${store.scheduleLabel}`, 'warning', 4000)
              return
            }
            setModal('delivery')
          }}
        />
      )}

      {modal === 'delivery' && (
        <DeliveryModal
          config={store.todayDelivery}
          subtotal={cart.subtotal}
          now={store.clock}
          onClose={() => setModal('cart')}
          onConfirm={handleSendOrder}
        />
      )}

      {modal === 'transfer' && (
        <TransferModal payment={store.payment} onClose={() => setModal(null)} />
      )}

      {modal === 'admin' && <AdminModal onClose={() => setModal(null)} />}
    </div>
  )
}

export default App
