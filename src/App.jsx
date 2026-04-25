// App.jsx
import { useState, useEffect } from 'react';
import './App.css';

// Componentes
import Header from './components/Header/Header';
import ProductCard from './components/ProductCard/ProductCard';
import IngredientModal from './components/IngredientModal/IngredientModal';
import CartModal from './components/CartModal/CartModal';
import TransferModal from './components/TransferModal/TransferModal';
import AdminModal from './components/AdminModal/AdminModal';
import DeliveryModal from './components/DeliveryModal/DeliveryModal';

// Datos y Firebase
import { 
  productsData as initialProducts, 
  allIngredients, 
  paymentData, 
  deliveryConfig as initialDeliveryConfig 
} from './data/products';
import { 
  saveStoreStatus, 
  saveProducts, 
  listenToStoreStatus, 
  listenToProducts,
  saveDeliveryConfig,
  listenToDeliveryConfig
} from './firebase';

function App() {
  // Estados principales
  const [activeProduct, setActiveProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [products, setProducts] = useState(initialProducts);
  const [deliverySettings, setDeliverySettings] = useState(initialDeliveryConfig);
  const [loading, setLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // Inicializar Firebase y cargar configuración
  useEffect(() => {
    // Intentar inicializar Firebase
    const initFirebase = async () => {
      try {
        saveStoreStatus(true);
        saveProducts(initialProducts);
        setFirebaseConnected(true);
        listenToDeliveryConfig((updatedConfig) => {
          if (updatedConfig) {
            setDeliverySettings(updatedConfig);
            // Opcional: Actualizar localStorage para persistencia offline
            localStorage.setItem('deliverySettings', JSON.stringify(updatedConfig));
          }
        });
      } catch (error) {
        console.log('Firebase no disponible, usando datos locales');
        setFirebaseConnected(false);
      }
    };

    initFirebase();

    // Escuchar estado de la tienda desde Firebase
    try {
      listenToStoreStatus((status) => {
        if (status && typeof status.isOpen === 'boolean') {
          setIsStoreOpen(status.isOpen);
        }
        setLoading(false);
      });

      listenToProducts((updatedProducts) => {
        if (updatedProducts && updatedProducts.length > 0) {
          setProducts(updatedProducts);
        }
      });
    } catch (error) {
      console.log('Usando datos locales');
      setLoading(false);
    }

    // Cargar configuración de entrega del localStorage
    const savedDelivery = localStorage.getItem('deliverySettings');
    if (savedDelivery) {
      setDeliverySettings(JSON.parse(savedDelivery));
    }
  }, []);

  const payment = paymentData;

  // Manejo de agregar productos
  const handleAddClick = (product) => {
    if (!isStoreOpen) {
      alert('🛑 La tienda está cerrada en este momento. Vuelve pronto.');
      return;
    }
    
    if (!product.customizable) {
      handleDirectAdd(product);
    } else {
      setActiveProduct(product);
    }
  };

  const handleDirectAdd = (product) => {
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      size: 'entero',
      customIngredients: [],
      uniqueId: Date.now(),
      customizable: false
    };
    setCart([...cart, newItem]);
  };

  const handleConfirmOrder = (product, ingredients, size, finalPrice) => {
    const newItem = {
      id: product.id,
      name: product.name,
      price: finalPrice,
      size: size,
      customIngredients: ingredients,
      uniqueId: Date.now(),
      customizable: true,
      baseIngredients: product.baseIngredients
    };
    setCart([...cart, newItem]);
    setActiveProduct(null);
  };

  // Carrito
  const removeFromCart = (uniqueId) => {
    setCart(cart.filter(item => item.uniqueId !== uniqueId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      setCart([]);
    }
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

  // WhatsApp con información de entrega
  const handleSendWhatsApp = (deliveryInfo) => {
    const total = deliveryInfo ? deliveryInfo.finalTotal : totalPrice;
    let message = `🍿 *NUEVO PEDIDO - BOTANAS MONY* 🍿\n\n`;
    message += `¡Hola Mony! Quiero hacer un pedido:\n\n`;
    
    cart.forEach((item, index) => {
      message += `📦 *${index + 1}. ${item.name}*`;
      if (item.size === 'mitad') {
        message += ` (Mitad)`;
      }
      message += ` - $${item.price}\n`;
      
      if (item.customizable && item.customIngredients.length > 0) {
        message += `   🥗 Ingredientes: ${item.customIngredients.join(', ')}\n`;
      }
      message += `\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━\n`;
    
    if (deliveryInfo) {
      message += `🛵 *Método:* ${deliveryInfo.method === 'pickup' ? 'Recoger en puesto' : 'Envío a domicilio'}\n`;
      message += `📍 *Dirección:* ${deliveryInfo.address}\n`;
      message += `🕐 *Horario:* ${deliveryInfo.time}\n`;
      if (deliveryInfo.deliveryCost > 0) {
        message += `💸 *Envío:* $${deliveryInfo.deliveryCost}\n`;
      }
      message += `💰 *TOTAL: $${total}*\n`;
    } else {
      message += `💰 *TOTAL: $${totalPrice}*\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━\n\n`;
    message += `✅ Confirmo que haré transferencia`;

    const url = `https://wa.me/52${payment.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    // Limpiar carrito después de enviar
    if (deliveryInfo) {
      setCart([]);
    }
  };

  // Funciones de administración
  const handleToggleStore = () => {
    const newState = !isStoreOpen;
    setIsStoreOpen(newState);
    
    if (firebaseConnected) {
      saveStoreStatus(newState);
    }
    localStorage.setItem('storeOpen', JSON.stringify(newState));
  };

  const handleUpdatePrices = (updatedProducts) => {
    setProducts(updatedProducts);
    
    if (firebaseConnected) {
      saveProducts(updatedProducts);
    }
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const handleUpdateDeliverySettings = (settings) => {
    setDeliverySettings(settings);
    
    if (firebaseConnected) {
      saveDeliveryConfig(settings);
    }
    localStorage.setItem('deliverySettings', JSON.stringify(settings));
  };

  const totalItems = cart.length;

  // Pantalla de carga
  if (loading) {
    return (
      <div className="app-container">
        <Header isStoreOpen={true} />
        <div className="loading-screen">
          <div className="loading-spinner">🍿</div>
          <p>Cargando Botanas Mony...</p>
          <small>Conectando con el servidor</small>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header isStoreOpen={isStoreOpen} />

      {/* Botón de administrador */}
      <button 
        className="admin-access-btn"
        onClick={() => setShowAdmin(true)}
        title="Administración"
        aria-label="Abrir panel de administración"
      >
        ⚙️
      </button>

      {/* Banner de tienda cerrada */}
      {!isStoreOpen && (
        <div className="store-closed-banner">
          <span>🔴</span>
          <p>Tienda cerrada temporalmente</p>
          <small>Volveremos pronto</small>
        </div>
      )}

      {/* Indicador de conexión */}
      {!firebaseConnected && (
        <div className="offline-banner">
          <span>📡</span>
          <small>Modo sin conexión - Los cambios solo se guardan localmente</small>
        </div>
      )}

      {/* Lista de productos */}
      <main className="product-list">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddClick={handleAddClick}
            disabled={!isStoreOpen}
          />
        ))}
      </main>

      {/* Botones flotantes (solo si la tienda está abierta) */}
      {isStoreOpen && (
        <div className="floating-buttons">
          <button 
            className="floating-btn transfer-btn"
            onClick={() => setShowTransfer(true)}
            aria-label="Ver datos de transferencia"
          >
            <span>💳</span>
            <span className="btn-label">Transferencia</span>
          </button>

          <button 
            className="floating-btn cart-btn"
            onClick={() => setShowCart(true)}
            aria-label={`Ver carrito con ${totalItems} productos`}
          >
            <span>🛒</span>
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
            <span className="btn-label">Carrito</span>
            {totalItems > 0 && (
              <span className="cart-total-badge">${totalPrice}</span>
            )}
          </button>
        </div>
      )}

      {/* Modal de Personalización */}
      {activeProduct && activeProduct.customizable && (
        <IngredientModal 
          product={activeProduct}
          allIngredients={allIngredients}
          onClose={() => setActiveProduct(null)}
          onConfirm={handleConfirmOrder}
        />
      )}

      {/* Modal del Carrito */}
      {showCart && (
        <CartModal 
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onClear={clearCart}
          onSendWhatsApp={() => {
            setShowCart(false);
            setShowDelivery(true);
          }}
        />
      )}

      {/* Modal de Entrega */}
      {showDelivery && (
        <DeliveryModal 
          config={deliverySettings}
          totalPrice={totalPrice}
          onClose={() => setShowDelivery(false)}
          onConfirm={(deliveryInfo) => {
            setShowDelivery(false);
            handleSendWhatsApp(deliveryInfo);
          }}
        />
      )}

      {/* Modal de Transferencia */}
      {showTransfer && (
        <TransferModal 
          paymentData={paymentData}
          onClose={() => setShowTransfer(false)}
        />
      )}

      {/* Modal de Administración */}
      {showAdmin && (
        <AdminModal 
          products={products}
          allIngredients={allIngredients}
          isOpen={isStoreOpen}
          onToggleStore={handleToggleStore}
          onUpdatePrices={handleUpdatePrices}
          onUpdateDeliverySettings={handleUpdateDeliverySettings}
          deliverySettings={deliverySettings}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
}

export default App;