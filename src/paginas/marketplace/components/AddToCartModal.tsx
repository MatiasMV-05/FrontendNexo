import React, { useState } from 'react';
import type { ProductDto } from '../../../types/Producto';
import '../styles/AddToCartModal.css';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: ProductDto, quantity: number) => void;
  product: ProductDto | null;
}

export default function AddToCartModal({ isOpen, onClose, onConfirm, product }: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    onConfirm(product, quantity);
    setQuantity(1); // reset
    onClose();
  };

  const handleClose = () => {
    setQuantity(1); // reset
    onClose();
  };

  return (
    <div className="add-to-cart-modal-overlay" onClick={handleClose}>
      <div className="add-to-cart-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="add-to-cart-modal-close" onClick={handleClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <h2 className="add-to-cart-modal-title">Añadir al carrito</h2>
        
        <div className="add-to-cart-modal-product">
          <div className="add-to-cart-modal-icon">
            <span className="material-symbols-outlined">inventory_2</span>
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
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span>{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="add-to-cart-modal-actions">
          <button className="btn-cancel" onClick={handleClose}>Cancelar</button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Añadir {quantity} al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
