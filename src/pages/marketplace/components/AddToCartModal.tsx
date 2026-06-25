import { useState } from 'react';
import type { ProductDto } from '../../../types/Producto';
import '../styles/AddToCartModal.css';
import { MdClose, MdInventory2 } from 'react-icons/md';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: ProductDto, cantidad: number) => void;
  product: ProductDto | null;
}

export default function AddToCartModal({ isOpen, onClose, onConfirm, product }: AddToCartModalProps) {
  const [cantidad, setCantidad] = useState(1);

  if (!isOpen || !product) return null;

  const manejarConfirmar = () => {
    onConfirm(product, cantidad);
    setCantidad(1);
    onClose();
  };

  const manejarCerrar = () => {
    setCantidad(1);
    onClose();
  };

  return (
    <div className="add-to-cart-modal-overlay" onClick={manejarCerrar}>
      <div className="add-to-cart-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="add-to-cart-modal-close" onClick={manejarCerrar}>
          <MdClose />
        </button>
        
        <h2 className="add-to-cart-modal-title">Añadir al carrito</h2>
        
        <div className="add-to-cart-modal-product">
          <div className="add-to-cart-modal-icon" style={{ overflow: 'hidden' }}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <MdInventory2 />
            )}
          </div>
          <div className="add-to-cart-modal-details">
            <h3>{product.name}</h3>
            <p className="add-to-cart-modal-price">${product.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="add-to-cart-modal-quantity-section">
          <label>Cantidad:</label>
          <div className="add-to-cart-modal-qty-controls">
            <button 
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              disabled={cantidad <= 1}
            >
              −
            </button>
            <span>{cantidad}</span>
            <button 
              onClick={() => setCantidad(cantidad + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="add-to-cart-modal-actions">
          <button className="btn-cancel" onClick={manejarCerrar}>Cancelar</button>
          <button className="btn-confirm" onClick={manejarConfirmar}>
            Añadir {cantidad} al carrito
          </button>
        </div>
      </div>
    </div>
  );
}