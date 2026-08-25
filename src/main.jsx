import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StoreProvider } from './context/StoreContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import UpdateBanner from './components/PwaPrompts/UpdateBanner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <StoreProvider>
        <CartProvider>
          {/* Fuera de App a propósito: aquí se monta una sola vez y no se
              desmonta al pasar de la pantalla de carga al menú, así el
              service worker se registra una vez y no acumula listeners. */}
          <UpdateBanner />
          <App />
        </CartProvider>
      </StoreProvider>
    </ToastProvider>
  </StrictMode>,
)
