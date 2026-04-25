// src/components/IngredientModal/IngredientModal.jsx
import { useState, useEffect } from 'react';
import './IngredientModal.css';

const IngredientModal = ({ product, allIngredients, onClose, onConfirm }) => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedSize, setSelectedSize] = useState('entero');

  const EXTRA_COST = 2; // $2 por cada ingrediente extra

  // Inicializar ingredientes base cuando el producto cambia
  useEffect(() => {
    if (product?.baseIngredients) {
      setSelectedIngredients([...product.baseIngredients]);
    }
    // Resetear tamaño a entero cuando cambia el producto
    setSelectedSize('entero');
  }, [product]);

  const handleCheckboxChange = (ingredient) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  // Calcular ingredientes extra y removidos
  const baseIngredientsList = product?.baseIngredients || [];
  
  const addedExtras = selectedIngredients.filter(
    ing => !baseIngredientsList.includes(ing)
  );
  
  const removedBase = baseIngredientsList.filter(
    ing => !selectedIngredients.includes(ing)
  );

  // Calcular extras netos
  const netExtras = Math.max(0, addedExtras.length - removedBase.length);
  
  // Calcular precio base según el tamaño seleccionado
  const getBasePrice = () => {
    if (!product) return 0;
    if (selectedSize === 'mitad' && product.hasHalfOption) {
      return product.halfPrice;
    }
    return product.price;
  };

  const basePrice = getBasePrice();
  const extraCharges = netExtras * EXTRA_COST;
  const finalPrice = basePrice + extraCharges;

  // Agrupar ingredientes por categorías
  const ingredientCategories = {
    "🥬 Vegetales": ["Jícama", "Zanahoria", "Pepino", "Betabel", "Col", "Jitomate", "Aguacate"],
    "🍖 Proteínas": ["Cueritos"],
    "🥛 Lácteos": ["Crema"],
    "🌶️ Salsas Líquidas": ["Salsa Valentina", "Salsa San Luis", "Salsa Botanera"],
    "🥜 Cacahuates": ["Cacahuate Japonés", "Cacahuate Queso", "Cacahuate Enchilado"],
    "🍬 Gomitas": ["Gomitas Gusano", "Gomitas Pandita"],
    "🔥 Botanas y Condimentos": ["Takis", "Chamoy", "Miguelito", "Tajín", "Limón", "Sal"]
  };

  if (!product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2 className="modal-title">Personaliza tu {product.name}</h2>
        
        {/* Selector de tamaño si aplica */}
        {product.hasHalfOption && (
          <div className="size-section">
            <p className="section-label">📏 Tamaño:</p>
            <div className="size-selector">
              <button 
                className={`size-btn ${selectedSize === 'entero' ? 'active' : ''}`}
                onClick={() => setSelectedSize('entero')}
              >
                Entero (${product.price})
              </button>
              <button 
                className={`size-btn ${selectedSize === 'mitad' ? 'active' : ''}`}
                onClick={() => setSelectedSize('mitad')}
              >
                Mitad (${product.halfPrice})
              </button>
            </div>
          </div>
        )}

        {/* Resumen de cambios y precios */}
        <div className="price-summary">
          <div className="price-row">
            <span>Precio base:</span>
            <span>${basePrice}</span>
          </div>
          
          {addedExtras.length > 0 && (
            <div className="price-row extra-added">
              <span>Ingredientes agregados: {addedExtras.length}</span>
              <span className="extra-detail">{addedExtras.join(', ')}</span>
            </div>
          )}
          
          {removedBase.length > 0 && (
            <div className="price-row extra-removed">
              <span>Ingredientes removidos: {removedBase.length}</span>
              <span className="extra-detail">{removedBase.join(', ')}</span>
            </div>
          )}
          
          {netExtras > 0 && (
            <div className="price-row extra-charge">
              <span>Cargo extra ({netExtras} × ${EXTRA_COST}):</span>
              <span>+${extraCharges}</span>
            </div>
          )}
          
          {netExtras === 0 && addedExtras.length > 0 && removedBase.length > 0 && (
            <div className="price-row free-exchange">
              <span>✨ ¡Intercambio sin costo!</span>
              <span>$0</span>
            </div>
          )}
          
          <div className="price-row total-row">
            <span>Total:</span>
            <span>${finalPrice}</span>
          </div>
        </div>

        {/* Todos los ingredientes organizados por categorías */}
        <div className="ingredients-container">
          <p className="section-label">
            🥗 Ingredientes:
            <span className="ingredient-hint">
              {netExtras > 0 ? 
                `+$${EXTRA_COST} por extra (${netExtras} extra${netExtras > 1 ? 's' : ''})` : 
                'Puedes intercambiar 1 a 1 sin costo'
              }
            </span>
          </p>
          
          {Object.entries(ingredientCategories).map(([category, ingredients]) => {
            const availableIngredients = ingredients.filter(ing => 
              allIngredients.includes(ing)
            );
            
            if (availableIngredients.length === 0) return null;
            
            return (
              <div key={category} className="ingredient-category">
                <h4 className="category-title">{category}</h4>
                <div className="checkbox-grid">
                  {availableIngredients.map(ing => {
                    const isBase = baseIngredientsList.includes(ing);
                    const isSelected = selectedIngredients.includes(ing);
                    const isExtra = isSelected && !isBase;
                    
                    return (
                      <label 
                        key={ing} 
                        className={`checkbox-item ${isBase ? 'base-ingredient' : ''} ${isExtra ? 'extra-selected' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleCheckboxChange(ing)}
                        />
                        <span>{ing}</span>
                        {isBase && <span className="base-badge">Base</span>}
                        {isExtra && <span className="extra-cost-badge">+$2</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen de ingredientes seleccionados */}
        <div className="selected-summary">
          <p className="summary-title">✅ Ingredientes seleccionados:</p>
          <div className="selected-tags">
            {selectedIngredients.length > 0 ? (
              selectedIngredients.map(ing => {
                const isBase = baseIngredientsList.includes(ing);
                return (
                  <span key={ing} className={`ingredient-tag ${!isBase ? 'extra-tag' : ''}`}>
                    {ing}
                    {!isBase && <span className="cost-indicator">+$2</span>}
                    <button 
                      className="remove-tag"
                      onClick={() => handleCheckboxChange(ing)}
                    >
                      ×
                    </button>
                  </span>
                );
              })
            ) : (
              <p className="no-ingredients">Ningún ingrediente seleccionado</p>
            )}
          </div>
        </div>

        <button 
          className="confirm-button" 
          onClick={() => onConfirm(product, selectedIngredients, selectedSize, finalPrice)}
        >
          Añadir al pedido - ${finalPrice}
        </button>
      </div>
    </div>
  );
};

export default IngredientModal;