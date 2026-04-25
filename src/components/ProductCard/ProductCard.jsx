// src/components/ProductCard/ProductCard.jsx
import './ProductCard.css';

const ProductCard = ({ product, onAddClick, disabled }) => {
  return (
    <div className={`card-container ${disabled ? 'disabled' : ''}`}>
      <div className="card-image-placeholder">
        <span>{product.name.charAt(0)}</span>
      </div>
      
      <div className="card-info">
        <h3 className="card-title">
          {product.name}
          {product.hasHalfOption && (
            <span className="half-badge">½ disponible</span>
          )}
        </h3>
        <p className="card-description">{product.description}</p>
        
        {product.customizable && (
          <span className="customizable-indicator">Personalizable</span>
        )}
        
        <div className="card-footer">
          <div className="card-price">
            ${product.price}
            {product.hasHalfOption && (
              <small>½: ${product.halfPrice}</small>
            )}
          </div>
          <button 
            className="card-button" 
            onClick={() => onAddClick(product)}
            disabled={disabled}
          >
            {disabled ? '🔒 Cerrado' : product.customizable ? 'Personalizar' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;