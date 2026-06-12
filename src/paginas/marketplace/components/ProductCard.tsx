import '../styles/ProductCard.css';
import type { ProductDto } from '../../../types/Producto';

interface ProductCardProps {
  product: ProductDto;
  onAddToCart: (product: ProductDto) => void;
  isAdding?: boolean;
}

export default function ProductCard({ product, onAddToCart, isAdding = false }: ProductCardProps) {
  const imageUrl = product.imageUrl || null;
  const sinStock = product.stock === 0;
  const pocoStock = product.stock > 0 && product.stock <= 5;

  return (
    <article className="marketplace-card">
      {/* Image */}
      <div className="marketplace-card-image-container">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="marketplace-card-image" />
        ) : (
          <div className="marketplace-card-image-placeholder">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
        )}

        {/* Category badge */}
        {product.category && (
          <div className="marketplace-card-category-badge">{product.category}</div>
        )}

        {/* Stock badge */}
        {sinStock && <div className="marketplace-card-badge agotado">Agotado</div>}
        {pocoStock && <div className="marketplace-card-badge poco-stock">¡Solo {product.stock} restantes!</div>}
      </div>

      {/* Content */}
      <div className="marketplace-card-content">
        <h3 className="marketplace-card-title">{product.name}</h3>

        {product.description && (
          <p className="marketplace-card-description">{product.description}</p>
        )}

        <div className="marketplace-card-price-row">
          <span className="marketplace-card-price">${product.price.toFixed(2)}</span>
          <span className={`marketplace-card-stock ${pocoStock ? 'low' : ''} ${sinStock ? 'out' : ''}`}>
            {sinStock ? 'Sin stock' : `${product.stock} en stock`}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="marketplace-card-footer">
        <button
          className="marketplace-card-btn-primary"
          disabled={sinStock || isAdding}
          onClick={() => onAddToCart(product)}
        >
          {isAdding ? (
            <>
              <span className="material-symbols-outlined spinning" style={{ fontSize: '18px' }}>progress_activity</span>
              Añadiendo...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shopping_cart</span>
              {sinStock ? 'Agotado' : 'Añadir al Carrito'}
            </>
          )}
        </button>
      </div>
    </article>
  );
}
