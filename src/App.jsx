// App.jsx
import { useState, useEffect } from 'react';
import './App.css';

// Importación de componentes
import Header from './components/Header/Header';
import ProductCard from './components/ProductCard/ProductCard';
import IngredientModal from './components/IngredientModal/IngredientModal';
import CartModal from './components/CartModal/CartModal';
import TransferModal from './components/TransferModal/TransferModal';
import AdminModal from './components/AdminModal/AdminModal';
import { productsData as initialProducts, allIngredients, paymentData } from './data/products';
import { 
  saveStoreStatus, 
  saveProducts, 
  listenToStoreStatus, 
  listenToProducts 
} from './firebase';

function App() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // Inicializar Firebase y escuchar cambios
  useEffect(() => {
    // Intentar inicializar datos en Firebase
    const initFirebase = async () => {
      try {
        saveStoreStatus(true);
        saveProducts(initialProducts);
        setFirebaseConnected(true);
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

      // Escuchar cambios en productos desde Firebase
      listenToProducts((updatedProducts) => {
        if (updatedProducts && updatedProducts.length > 0) {
          setProducts(updatedProducts);
        }
      });
    } catch (error) {
      console.log('Usando datos locales');
      setLoading(false);
    }
  }, []);

  const payment = paymentData;

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

  const removeFromCart = (uniqueId) => {
    setCart(cart.filter(item => item.uniqueId !== uniqueId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      setCart([]);
    }
  };

  const sendWhatsApp = () => {
    const total = cart.reduce((acc, item) => acc + item.price, 0);
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
      } else if (!item.customizable) {
        message += `   ⭐ Producto sin personalizar\n`;
      }
      message += `\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *TOTAL: $${total}*\n`;
    message += `━━━━━━━━━━━━━━━━━━\n\n`;
    message += `✅ Confirmo que haré transferencia`;

    const url = `https://wa.me/52${payment.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Funciones de administración
  const handleToggleStore = () => {
    const newState = !isStoreOpen;
    setIsStoreOpen(newState);
    
    // Guardar en Firebase si está disponible
    if (firebaseConnected) {
      saveStoreStatus(newState);
    }
    
    // También guardar en localStorage como respaldo
    localStorage.setItem('storeOpen', JSON.stringify(newState));
  };

  const handleUpdatePrices = (updatedProducts) => {
    setProducts(updatedProducts);
    
    // Guardar en Firebase si está disponible
    if (firebaseConnected) {
      saveProducts(updatedProducts);
    }
    
    // También guardar en localStorage como respaldo
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const totalItems = cart.length;
  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

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

      {/* Botón de administrador (sutil) */}
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

      {/* Indicador de conexión Firebase */}
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

      {/* Botones flotantes */}
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
          onSendWhatsApp={sendWhatsApp}
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
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
}

export default App;