// src/components/ProductCard/ProductCard.jsx
import { useState } from 'react';
import './ProductCard.css';

const ProductCard = ({ product, onAddClick, disabled }) => {
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Función para manejar el clic en la imagen
  const handleImageClick = () => {
    if (product.image && !imageError) {
      setIsZoomed(true);
    }
  };

  return (
    <>
      <div className={`card-container ${disabled ? 'disabled' : ''}`}>
        <div 
          className="card-image-placeholder" 
          onClick={handleImageClick}
          style={{ cursor: product.image && !imageError ? 'zoom-in' : 'default' }}
        >
          {product.image && !imageError ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="card-image"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <span className="card-image-letter">{product.name.charAt(0)}</span>
          )}
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

      {/* Modal de Imagen Ampliada */}
      {isZoomed && (
        <div className="image-overlay" onClick={() => setIsZoomed(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-zoom" onClick={() => setIsZoomed(false)}>✕</button>
            <img 
              src={product.image} 
              alt={product.name} 
              className="full-res-image" 
            />
            <p className="image-caption">{product.name}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;