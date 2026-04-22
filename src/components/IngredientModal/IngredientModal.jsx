// IngredientModal.jsx - VERSIÓN SIMPLIFICADA
import { useState, useEffect } from 'react';
import './IngredientModal.css';

const IngredientModal = ({ product, allIngredients, onClose, onConfirm }) => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedSize, setSelectedSize] = useState('entero');

  // Inicializar ingredientes base cuando el producto cambia
  useEffect(() => {
    if (product?.baseIngredients) {
      setSelectedIngredients([...product.baseIngredients]);
    }
  }, [product]);

  const handleCheckboxChange = (ingredient) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  // Agrupar ingredientes por categorías para mejor organización visual
  const ingredientCategories = {
    "🥬 Vegetales": ["Jícama", "Zanahoria", "Pepino", "Betabel", "Col", "Jitomate", "Aguacate"],
    "🍖 Proteínas": ["Cueritos"],
    "🥛 Lácteos": ["Crema"],
    "🌶️ Salsas Líquidas": ["Salsa Valentina", "Salsa San Luis", "Salsa Botanera"],
    "🥜 Cacahuates": ["Cacahuate Japonés", "Cacahuate Queso", "Cacahuate Enchilado"],
    "🍬 Gomitas": ["Gomitas Gusano", "Gomitas Pandita"],
    "🔥 Botanas y Condimentos": ["Takis", "Chamoy", "Miguelito", "Tajín", "Limón", "Sal"]
  };

  // Calcular precio según tamaño
  const currentPrice = selectedSize === 'mitad' && product.hasHalfOption 
    ? product.halfPrice 
    : product.price;

  if (!product) return null;

  const baseIngredientsList = product?.baseIngredients || [];

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

        {/* Todos los ingredientes organizados por categorías */}
        <div className="ingredients-container">
          <p className="section-label">
            🥗 Ingredientes:
            <span className="ingredient-hint">Marca/desmarca según tu gusto</span>
          </p>
          
          {Object.entries(ingredientCategories).map(([category, ingredients]) => {
            // Filtrar ingredientes que existen en allIngredients
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
                    return (
                      <label 
                        key={ing} 
                        className={`checkbox-item ${isBase ? 'base-ingredient' : 'extra-ingredient'}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedIngredients.includes(ing)}
                          onChange={() => handleCheckboxChange(ing)}
                        />
                        <span>{ing}</span>
                        {isBase && <span className="base-badge">Base</span>}
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
              selectedIngredients.map(ing => (
                <span key={ing} className="ingredient-tag">
                  {ing}
                  <button 
                    className="remove-tag"
                    onClick={() => handleCheckboxChange(ing)}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <p className="no-ingredients">Ningún ingrediente seleccionado</p>
            )}
          </div>
        </div>

        <button 
          className="confirm-button" 
          onClick={() => onConfirm(product, selectedIngredients, selectedSize)}
        >
          Añadir al pedido - ${currentPrice}
        </button>
      </div>
    </div>
  );
};

export default IngredientModal;