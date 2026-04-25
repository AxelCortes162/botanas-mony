// src/components/AdminModal/AdminModal.jsx
import { useState } from 'react';
import './AdminModal.css';

const AdminModal = ({ 
  products, 
  allIngredients, 
  isOpen, 
  onToggleStore, 
  onUpdatePrices,
  onUpdateDeliverySettings,
  deliverySettings,
  onClose 
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('status');
  const [editedProducts, setEditedProducts] = useState([...products]);
  const [message, setMessage] = useState('');
  
  // Estados para ingredientes
  const [newIngredient, setNewIngredient] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [tempIngredients, setTempIngredients] = useState([]);
  const [localIngredients, setLocalIngredients] = useState([...allIngredients]);
  const [localProducts, setLocalProducts] = useState([...products]);
  
  // Estados para configuración de entrega
  const [localDeliverySettings, setLocalDeliverySettings] = useState({...deliverySettings});

  const ADMIN_PASSWORD = 'mony2024';

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

  // Funciones para ingredientes
  const handleAddIngredient = () => {
    if (newIngredient.trim() && !localIngredients.includes(newIngredient.trim())) {
      const updatedIngredients = [...localIngredients, newIngredient.trim()];
      setLocalIngredients(updatedIngredients);
      setNewIngredient('');
      setSelectedCategory('');
      setMessage('✅ Ingrediente agregado correctamente');
      setTimeout(() => setMessage(''), 3000);
    } else if (localIngredients.includes(newIngredient.trim())) {
      setMessage('⚠️ Este ingrediente ya existe');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveIngredient = (productId, ingredient) => {
    if (confirm(`¿Quitar "${ingredient}" de los ingredientes base?`)) {
      const updatedProducts = localProducts.map(product => {
        if (product.id === productId && product.baseIngredients) {
          return {
            ...product,
            baseIngredients: product.baseIngredients.filter(ing => ing !== ingredient)
          };
        }
        return product;
      });
      setLocalProducts(updatedProducts);
      setMessage('✅ Ingrediente removido');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const startEditingIngredients = (product) => {
    setEditingProduct(product.id);
    setTempIngredients([...(product.baseIngredients || [])]);
  };

  const toggleTempIngredient = (ingredient) => {
    if (tempIngredients.includes(ingredient)) {
      setTempIngredients(tempIngredients.filter(i => i !== ingredient));
    } else {
      setTempIngredients([...tempIngredients, ingredient]);
    }
  };

  const handleSaveIngredients = (productId) => {
    const updatedProducts = localProducts.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          baseIngredients: [...tempIngredients]
        };
      }
      return product;
    });
    setLocalProducts(updatedProducts);
    setEditingProduct(null);
    setMessage('✅ Ingredientes base actualizados');
    setTimeout(() => setMessage(''), 3000);
  };

  // Funciones para configuración de entrega
  const toggleDeliverySetting = (key) => {
    const updated = {
      ...localDeliverySettings,
      [key]: !localDeliverySettings[key]
    };
    setLocalDeliverySettings(updated);
  };

  const updateDeliverySetting = (key, value) => {
    const updated = {
      ...localDeliverySettings,
      [key]: value
    };
    setLocalDeliverySettings(updated);
  };

  const handleSaveDeliverySettings = () => {
    onUpdateDeliverySettings(localDeliverySettings);
    setMessage('✅ Configuración de entrega actualizada');
    setTimeout(() => setMessage(''), 3000);
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
          <button 
            className={`admin-tab ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivery')}
          >
            🚚 Entrega
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
                      <label htmlFor={`price-${product.id}`}>Entero:</label>
                      <div className="input-with-prefix">
                        <span className="prefix">$</span>
                        <input
                          id={`price-${product.id}`}
                          name={`price-${product.id}`}
                          type="number"
                          value={product.price}
                          onChange={(e) => handlePriceChange(product.id, 'price', e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                    
                    {product.hasHalfOption && (
                      <div className="price-input-group">
                        <label htmlFor={`half-price-${product.id}`}>Mitad:</label>
                        <div className="input-with-prefix">
                          <span className="prefix">$</span>
                          <input
                            id={`half-price-${product.id}`}
                            name={`half-price-${product.id}`}
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
              <div className="add-ingredient-section">
                <h4>➕ Agregar Nuevo Ingrediente</h4>
                <div className="add-ingredient-form">
                  <input
                    id="new-ingredient"
                    name="new-ingredient"
                    type="text"
                    className="ingredient-input"
                    placeholder="Nombre del ingrediente"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                  />
                  <select 
                    id="ingredient-category"
                    name="ingredient-category"
                    className="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Vegetales">🥬 Vegetales</option>
                    <option value="Proteínas">🍖 Proteínas</option>
                    <option value="Lácteos">🥛 Lácteos</option>
                    <option value="Salsas Líquidas">🌶️ Salsas Líquidas</option>
                    <option value="Cacahuates">🥜 Cacahuates</option>
                    <option value="Gomitas">🍬 Gomitas</option>
                    <option value="Botanas y Condimentos">🔥 Botanas y Condimentos</option>
                  </select>
                  <button 
                    className="add-ingredient-btn"
                    onClick={handleAddIngredient}
                  >
                    Agregar
                  </button>
                </div>
              </div>

              <div className="ingredients-list">
                <h4>📋 Ingredientes Base por Producto</h4>
                {products.map(product => (
                  <div key={product.id} className="product-ingredients-card">
                    <div className="product-ingredients-header">
                      <h5>{product.name}</h5>
                      <button 
                        className="edit-ingredients-btn"
                        onClick={() => startEditingIngredients(product)}
                      >
                        ✏️ Editar
                      </button>
                    </div>
                    
                    {editingProduct === product.id ? (
                      <div className="edit-ingredients-mode">
                        <p className="edit-hint">Selecciona los ingredientes base:</p>
                        <div className="edit-ingredients-grid">
                          {allIngredients.map((ing, index) => (
                            <label 
                              key={`edit-${product.id}-${ing}-${index}`}
                              className="edit-ingredient-item"
                            >
                              <input
                                type="checkbox"
                                checked={tempIngredients.includes(ing)}
                                onChange={() => toggleTempIngredient(ing)}
                              />
                              <span>{ing}</span>
                            </label>
                          ))}
                        </div>
                        <div className="edit-actions">
                          <button 
                            className="save-edit-btn"
                            onClick={() => handleSaveIngredients(product.id)}
                          >
                            💾 Guardar
                          </button>
                          <button 
                            className="cancel-edit-btn"
                            onClick={() => setEditingProduct(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {product.baseIngredients && product.baseIngredients.length > 0 ? (
                          <div className="base-ingredients-tags">
                            {product.baseIngredients.map((ing, index) => (
                              <span 
                                key={`${product.id}-${ing}-${index}`} 
                                className="base-ingredient-tag"
                              >
                                {ing}
                                <button 
                                  className="remove-ingredient-btn"
                                  onClick={() => handleRemoveIngredient(product.id, ing)}
                                  title="Quitar ingrediente"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="no-customization">Producto no personalizable</p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="all-ingredients-section">
                <h4>🗂️ Todos los Ingredientes Disponibles ({allIngredients.length})</h4>
                <div className="all-ingredients-tags">
                  {allIngredients && allIngredients.length > 0 ? (
                    allIngredients.map((ing, index) => (
                      <span 
                        key={`all-${ing}-${index}`} 
                        className="available-ingredient-tag"
                      >
                        {ing}
                      </span>
                    ))
                  ) : (
                    <p>No hay ingredientes disponibles</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Configuración de Entrega */}
        {activeTab === 'delivery' && (
          <div className="admin-tab-content">
            <h3>Configuración de Entrega</h3>
            
            <div className="delivery-config">
              <div className="config-card">
                <h4>🏪 Recoger en Puesto</h4>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={localDeliverySettings.pickupEnabled}
                    onChange={() => toggleDeliverySetting('pickupEnabled')}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {localDeliverySettings.pickupEnabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </label>
              </div>

              <div className="config-card">
                <h4>🛵 Envío a Domicilio</h4>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={localDeliverySettings.deliveryEnabled}
                    onChange={() => toggleDeliverySetting('deliveryEnabled')}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {localDeliverySettings.deliveryEnabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </label>
                
                <div className="config-input">
                  <label>Costo de envío:</label>
                  <div className="input-with-prefix">
                    <span className="prefix">$</span>
                    <input
                      type="number"
                      value={localDeliverySettings.deliveryCost}
                      onChange={(e) => updateDeliverySetting('deliveryCost', Number(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="config-card">
                <h4>⏰ Horarios</h4>
                <div className="config-row">
                  <div className="config-input">
                    <label>Apertura:</label>
                    <input
                      type="time"
                      value={localDeliverySettings.openingTime}
                      onChange={(e) => updateDeliverySetting('openingTime', e.target.value)}
                    />
                  </div>
                  <div className="config-input">
                    <label>Cierre:</label>
                    <input
                      type="time"
                      value={localDeliverySettings.closingTime}
                      onChange={(e) => updateDeliverySetting('closingTime', e.target.value)}
                    />
                  </div>
                </div>
                <div className="config-input">
                  <label>Intervalo entre horarios (minutos):</label>
                  <input
                    type="number"
                    value={localDeliverySettings.scheduleInterval}
                    onChange={(e) => updateDeliverySetting('scheduleInterval', Number(e.target.value))}
                    min="5"
                  />
                </div>
                <div className="config-input">
                  <label>Tiempo de preparación (minutos):</label>
                  <input
                    type="number"
                    value={localDeliverySettings.preparationTime}
                    onChange={(e) => updateDeliverySetting('preparationTime', Number(e.target.value))}
                    min="10"
                  />
                </div>
              </div>

              <button className="save-button" onClick={handleSaveDeliverySettings}>
                💾 Guardar Configuración
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;