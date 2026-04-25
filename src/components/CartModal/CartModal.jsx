// src/components/CartModal/CartModal.jsx
import './CartModal.css';

const CartModal = ({ cart, onClose, onRemove, onClear, onSendWhatsApp }) => {
  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cart-modal-header">
          <h2 className="cart-modal-title">
            <span>🛒</span> Tu Pedido
          </h2>
          <button className="cart-modal-close" onClick={onClose}>×</button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-icon">🛒</span>
            <p>Tu carrito está vacío</p>
            <p className="cart-empty-subtitle">¡Agrega algunos productos deliciosos!</p>
          </div>
        ) : (
          <>
            <div className="cart-items-container">
              {cart.map((item) => (
                <div key={item.uniqueId} className="cart-item">
                  <div className="cart-item-image">
                    <span>{item.name.charAt(0)}</span>
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-header">
                      <span className="cart-item-name">{item.name}</span>
                      {item.size === 'mitad' && (
                        <span className="cart-item-badge">Mitad</span>
                      )}
                      {!item.customizable && (
                        <span className="cart-item-badge">Producto fijo</span>
                      )}
                    </div>
                    
                    {/* Mostrar ingredientes solo si es personalizable */}
                    {item.customizable && item.customIngredients && item.customIngredients.length > 0 && (
                      <div className="cart-item-customization">
                        <small>🥗 {item.customIngredients.join(', ')}</small>
                      </div>
                    )}
                    
                    <span className="cart-item-price">${item.price}</span>
                  </div>
                  <button 
                    className="cart-item-remove"
                    onClick={() => onRemove(item.uniqueId)}
                    aria-label="Eliminar item"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-modal-footer">
              <div className="cart-total">
                <span>Total a pagar:</span>
                <span className="cart-total-amount">${totalPrice}</span>
              </div>
              
              <div className="cart-actions">
                <button className="btn-clear-cart" onClick={onClear}>
                  <span>🗑️</span> Vaciar Carrito
                </button>
                <button className="btn-send-whatsapp" onClick={() => {
                  onClose();
                  onSendWhatsApp();
                }}>
                  <span>💬</span> Enviar por WhatsApp
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;