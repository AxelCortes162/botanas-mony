// ProductCard.jsx
import './ProductCard.css';

const ProductCard = ({ product, onAddClick }) => {
  return (
    <div className="card-container">
      <div className="card-image-placeholder">
        <span>{product.name.charAt(0)}</span>
      </div>
      
      <div className="card-info">
        <div className="card-header">
          <h3 className="card-title">{product.name}</h3>
          {!product.customizable && (
            <span className="fixed-badge">Producto fijo</span>
          )}
        </div>
        <p className="card-description">{product.description}</p>
        
        <div className="card-footer">
          <span className="card-price">${product.price}</span>
          <button className="card-button" onClick={() => onAddClick(product)}>
            {product.customizable ? 'Personalizar +' : 'Añadir +'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;