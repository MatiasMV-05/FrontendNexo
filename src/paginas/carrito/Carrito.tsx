import { useState, useEffect } from 'react';
import { cartService } from '../../api/cart';
import type { OrderResponseDto, OrderItemDto } from '../../types/Pedido';
import './styles/Carrito.css';

export default function Carrito() {
  const [cart, setCart] = useState<OrderResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.getMyCart();
      setCart(response.data);
    } catch (err: any) {
      const status = err.response?.status;
      // 404 = no cart yet, not a real error
      if (status === 404) {
        setCart(null);
        setError(null);
      } else {
        setError('No se pudo cargar el carrito. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      setRemovingId(productId);
      await cartService.removeItemFromCart(productId);
      await loadCart();
    } catch {
      alert('Error al eliminar el producto del carrito');
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      await cartService.checkout();
      alert('¡Pago procesado exitosamente! Revisa Mis Pedidos para ver el estado.');
      await loadCart();
    } catch (err: any) {
      const msg = err.response?.data?.data || err.response?.data?.messages?.[0]?.description || 'Error al procesar el pago';
      alert(`Error: ${msg}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const items: OrderItemDto[] = cart?.orderItems ?? [];
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const shipping = items.length > 0 ? 12.50 : 0;
  const total = subtotal + shipping;

  return (
    <div className="carrito-page">

      <div className="carrito-main">
        {/* Header */}
        <header className="carrito-topheader">
          <h2>🛒 Carrito de Compras</h2>
          <a href="/marketplace" className="carrito-back-link">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Continuar Comprando
          </a>
        </header>

        {/* Loading */}
        {loading && (
          <div className="carrito-state">
            <span className="material-symbols-outlined carrito-state-icon">hourglass_top</span>
            <h2>Cargando tu carrito...</h2>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="carrito-state">
            <span className="material-symbols-outlined carrito-state-icon" style={{ color: '#ba1a1a' }}>error</span>
            <h2>Ocurrió un error</h2>
            <p>{error}</p>
            <button className="carrito-btn-continue" onClick={loadCart}>Reintentar</button>
          </div>
        )}

        {/* Empty cart */}
        {!loading && !error && items.length === 0 && (
          <div className="carrito-state">
            <span className="material-symbols-outlined carrito-state-icon">shopping_cart</span>
            <h2>Tu carrito está vacío</h2>
            <p>Aún no has añadido ningún producto. ¡Explora el marketplace!</p>
            <a href="/marketplace" className="carrito-btn-continue">Ir al Marketplace</a>
          </div>
        )}

        {/* Cart with items */}
        {!loading && !error && items.length > 0 && (
          <div className="carrito-content">
            {/* Left column: items */}
            <div className="carrito-items-column">
              <h1 className="carrito-section-title">Mi Carrito</h1>
              <p className="carrito-section-subtitle">{items.length} {items.length === 1 ? 'artículo' : 'artículos'} en tu carrito</p>

              {items.map((item) => (
                <div key={item.productId} className="carrito-item">
                  {/* Image placeholder */}
                  <div className="carrito-item-img">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>

                  {/* Details */}
                  <div className="carrito-item-details">
                    <h3 className="carrito-item-name">
                      {item.productName ?? `Producto #${item.productId}`}
                    </h3>
                    <p className="carrito-item-unit-price">Precio unitario: ${item.unitPrice.toFixed(2)}</p>

                    <div className="carrito-item-bottom">
                      <div className="carrito-item-qty">
                        <button disabled>−</button>
                        <span className="carrito-item-qty-count">{item.quantity}</span>
                        <button disabled>+</button>
                      </div>

                      <button
                        className="carrito-item-remove"
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={removingId === item.productId}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        {removingId === item.productId ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="carrito-item-subtotal">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Right column: summary */}
            <div className="carrito-summary-column">
              <div className="carrito-summary-card">
                <h2 className="carrito-summary-title">Resumen de Orden</h2>

                {items.map((item) => (
                  <div key={item.productId} className="carrito-summary-line">
                    <span>{item.productName ?? `Producto #${item.productId}`} (×{item.quantity})</span>
                    <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="carrito-summary-line">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="carrito-summary-line">
                  <span>Envío estimado</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>

                <div className="carrito-summary-total">
                  <span>Total</span>
                  <span className="carrito-summary-total-amount">${total.toFixed(2)}</span>
                </div>

                <button
                  className="carrito-btn-checkout"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock</span>
                  {checkoutLoading ? 'Procesando pago...' : 'Proceder al Pago'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
