// src/components/AdminModal/AdminModal.jsx
import { useState } from 'react';
import './AdminModal.css';

const AdminModal = ({ 
  products, 
  allIngredients, 
  isOpen, 
  onToggleStore, 
  onUpdatePrices,
  onUpdateIngredients,
  onClose 
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('status');
  const [editedProducts, setEditedProducts] = useState([...products]);
  const [message, setMessage] = useState('');

  const ADMIN_PASSWORD = 'mony2024'; // Contraseña del administrador

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setMessage('');
    } else {
      setMessage('Contraseña incorrecta');
    }
  };

  const handlePriceChange = (productId, field, value) => {
    const newProducts = editedProducts.map(product => {
      if (product.id === productId) {
        return { ...product, [field]: Number(value) || 0 };
      }
      return product;
    });
    setEditedProducts(newProducts);
  };

  const handleSavePrices = () => {
    onUpdatePrices(editedProducts);
    setMessage('✅ Precios actualizados correctamente');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleToggleStore = () => {
    onToggleStore();
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-modal-overlay" onClick={onClose}>
        <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="admin-modal-header">
            <h2 className="admin-modal-title">
              <span>🔐</span> Acceso Administrador
            </h2>
            <button className="admin-modal-close" onClick={onClose}>×</button>
          </div>
          
          <div className="admin-login">
            <div className="login-icon">👩‍🍳</div>
            <p className="login-text">Ingresa la contraseña para acceder</p>
            <input
            id="admin-password"
            name="admin-password"
            type="password"
            className="login-input"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            {message && <p className="login-message">{message}</p>}
            <button className="login-button" onClick={handleLogin}>
              Acceder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">
            <span>⚙️</span> Panel de Administración
          </h2>
          <button className="admin-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Tabs de navegación */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            🏪 Estado
          </button>
          <button 
            className={`admin-tab ${activeTab === 'prices' ? 'active' : ''}`}
            onClick={() => setActiveTab('prices')}
          >
            💰 Precios
          </button>
          <button 
            className={`admin-tab ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            🥗 Ingredientes
          </button>
        </div>

        {message && <div className="admin-message">{message}</div>}

        {/* Tab: Estado de la tienda */}
        {activeTab === 'status' && (
          <div className="admin-tab-content">
            <h3>Estado de la Tienda</h3>
            
            <div className="store-status-card">
              <div className={`status-indicator ${isOpen ? 'open' : 'closed'}`}>
                <span className="status-dot"></span>
                <span className="status-text">
                  {isOpen ? 'Tienda Abierta 🟢' : 'Tienda Cerrada 🔴'}
                </span>
              </div>
              
              <p className="status-description">
                {isOpen 
                  ? 'Los clientes pueden hacer pedidos normalmente' 
                  : 'Los clientes verán un mensaje de tienda cerrada'
                }
              </p>

              <button 
                className={`toggle-store-btn ${isOpen ? 'close' : 'open'}`}
                onClick={handleToggleStore}
              >
                {isOpen ? '🔒 Cerrar Tienda' : '🔓 Abrir Tienda'}
              </button>
            </div>

            <div className="admin-info">
              <h4>📊 Información Rápida</h4>
              <div className="info-grid">
                <div className="info-card">
                  <span className="info-label">Productos</span>
                  <span className="info-value">{products.length}</span>
                </div>
                <div className="info-card">
                  <span className="info-label">Ingredientes</span>
                  <span className="info-value">{allIngredients.length}</span>
                </div>
                <div className="info-card">
                  <span className="info-label">Precio Extra</span>
                  <span className="info-value">$2.00</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Precios */}
        {activeTab === 'prices' && (
          <div className="admin-tab-content">
            <h3>Gestión de Precios</h3>
            
            <div className="prices-list">
              {editedProducts.map(product => (
                <div key={product.id} className="price-item">
                  <div className="price-item-header">
                    <span className="price-item-name">{product.name}</span>
                    <span className="price-item-category">{product.category}</span>
                  </div>
                  
                  <div className="price-inputs">
                    <div className="price-input-group">
                      <label>Entero:</label>
                      <div className="input-with-prefix">
                        <span className="prefix">$</span>
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) => handlePriceChange(product.id, 'price', e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                    
                    {product.hasHalfOption && (
                      <div className="price-input-group">
                        <label>Mitad:</label>
                        <div className="input-with-prefix">
                          <span className="prefix">$</span>
                          <input
                            type="number"
                            value={product.halfPrice}
                            onChange={(e) => handlePriceChange(product.id, 'halfPrice', e.target.value)}
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="save-button" onClick={handleSavePrices}>
              💾 Guardar Cambios
            </button>
          </div>
        )}

        {/* Tab: Ingredientes */}
        {activeTab === 'ingredients' && (
          <div className="admin-tab-content">
            <h3>Gestión de Ingredientes</h3>
            
            <div className="ingredients-manager">
              <div className="ingredients-list">
                <h4>Ingredientes Base por Producto</h4>
                {products.map(product => (
                  <div key={product.id} className="product-ingredients-card">
                    <h5>{product.name}</h5>
                    <div className="base-ingredients-tags">
                      {product.baseIngredients.map(ing => (
                        <span key={ing} className="base-ingredient-tag">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="all-ingredients-section">
                <h4>Todos los Ingredientes Disponibles</h4>
                <div className="all-ingredients-tags">
                  {allIngredients.map(ing => (
                    <span key={ing} className="available-ingredient-tag">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;