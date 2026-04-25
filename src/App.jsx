// App.jsx - Agregar sistema de administración
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

function App() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [products, setProducts] = useState(initialProducts);
  
  // Cargar estado de la tienda desde localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('storeOpen');
    if (savedState !== null) {
      setIsStoreOpen(JSON.parse(savedState));
    }
    
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
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
    localStorage.setItem('storeOpen', newState);
  };

  const handleUpdatePrices = (updatedProducts) => {
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const totalItems = cart.length;
  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="app-container">
      <Header isStoreOpen={isStoreOpen} />

      {/* Botón de administrador (sutil) */}
      <button 
        className="admin-access-btn"
        onClick={() => setShowAdmin(true)}
        title="Administración"
      >
        ⚙️
      </button>

      {!isStoreOpen && (
        <div className="store-closed-banner">
          <span>🔴</span>
          <p>Tienda cerrada temporalmente</p>
          <small>Volveremos pronto</small>
        </div>
      )}

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
          >
            <span>💳</span>
            <span className="btn-label">Transferencia</span>
          </button>

          <button 
            className="floating-btn cart-btn"
            onClick={() => setShowCart(true)}
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

      {/* Modales */}
      {activeProduct && activeProduct.customizable && (
        <IngredientModal 
          product={activeProduct}
          allIngredients={allIngredients}
          onClose={() => setActiveProduct(null)}
          onConfirm={handleConfirmOrder}
        />
      )}

      {showCart && (
        <CartModal 
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onClear={clearCart}
          onSendWhatsApp={sendWhatsApp}
        />
      )}

      {showTransfer && (
        <TransferModal 
          paymentData={paymentData}
          onClose={() => setShowTransfer(false)}
        />
      )}

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