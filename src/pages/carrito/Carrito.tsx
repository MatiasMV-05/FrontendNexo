// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { cartService } from '../../services/cart';
import type { OrderResponseDto, OrderItemDto } from '../../types/Pedido';
import { useNotification } from '../../contexts/NotificationContext';
import './styles/Carrito.css';
import { Helmet } from 'react-helmet-async';
import { MdArrowBack, MdHourglassTop, MdError, MdShoppingCart, MdInventory2, MdDelete, MdLock } from 'react-icons/md';

export default function Carrito() {
  const [carrito, setCarrito] = useState<OrderResponseDto | null>(null);
  const [cargandoCarrito, setCargandoCarrito] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { mostrarNotificacion } = useNotification();

  useEffect(() => {
    cargarCarrito();
    // Cleanup timeout en unmount
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  const cargarCarrito = async () => {
    try {
      setCargandoCarrito(true);
      setError(null);
      const response = await cartService.getMyCart();
      setCarrito(response.data);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 404) {
        setCarrito(null);
        setError(null);
      } else {
        setError('No se pudo cargar el carrito. Verifica tu conexión.');
      }
    } finally {
      setCargandoCarrito(false);
    }
  };

  const manejarEliminarItem = async (productId: number) => {
    try {
      setEliminandoId(productId);
      await cartService.removeItemFromCart(productId);
      await cargarCarrito();
      window.dispatchEvent(new Event('cart-updated'));
      mostrarNotificacion('Producto eliminado del carrito', 'success');
    } catch {
      mostrarNotificacion('Error al eliminar el producto del carrito', 'error');
    } finally {
      setEliminandoId(null);
    }
  };

  const manejarActualizarCantidad = (productId: number, nuevaCantidad: number) => {
    // Bloquear en 1: no eliminar, el usuario debe usar el botón Eliminar
    if (nuevaCantidad < 1) return;

    // 1. Actualización visual inmediata (Optimistic UI)
    setCarrito(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        orderItems: prev.orderItems.map(item => 
          item.productId === productId ? { ...item, quantity: nuevaCantidad } : item
        )
      };
    });

    // 2. Cancelar petición anterior si el usuario apreta repetidamente (Debounce)
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // 3. Mandar al servidor cuando el usuario se detiene (después de 500ms)
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        setActualizandoId(productId);
        await cartService.updateItemQuantity(productId, nuevaCantidad);
        window.dispatchEvent(new Event('cart-updated'));
        // Ya se actualizó visualmente, no es estrictamente necesario recargar 
        // pero podemos recargar en background si hay reglas de negocio del backend
      } catch {
        mostrarNotificacion('Error al actualizar la cantidad del producto', 'error');
        cargarCarrito(); // Revertir al estado real en caso de error
      } finally {
        setActualizandoId(null);
      }
    }, 600);
  };

  const procesarPago = async () => {
    try {
      setProcesandoPago(true);
      await cartService.checkout();
      mostrarNotificacion('¡Pago procesado exitosamente! Revisa Mis Pedidos para ver el estado.', 'success');
      window.dispatchEvent(new Event('wallet-updated'));
      window.dispatchEvent(new Event('cart-updated'));
      await cargarCarrito();
    } catch (err: any) {
      // El backend devuelve ApiResponse<string> con el mensaje en .data
      // Para errores de negocio (422): { data: "Saldo insuficiente...", messages: [...] }
      // Para errores genéricos (500): { data: "Error: ...", messages: [...] }
      const mensajeError =
        err.response?.data?.data ||
        err.response?.data?.messages?.[0]?.description ||
        err.message ||
        'Error al procesar el pago';
      mostrarNotificacion(`Error: ${mensajeError}`, 'error');
    } finally {
      setProcesandoPago(false);
    }
  };

  const articulos: OrderItemDto[] = carrito?.orderItems ?? [];
  const subtotal = articulos.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const total = subtotal;

  return (
    <div>
      <Helmet>
        <title>Carrito de Compras - Mi Aplicación</title>
        <meta
          name="description"
          content="Revisa los productos que has añadido a tu carrito de compras, ajusta cantidades o procede al pago."
        />
        <meta
          name="keywords"
          content="carrito de compras, checkout, productos, tienda en línea, ecommerce"
        />
        <meta
          name="author"
          content="Nexo"
        />
        {/* Open Graph */}

        <meta
          property="og:title"
          content="Carrito de Compras - Mi Aplicación"
        />
        <meta
          property="og:description"
          content="Revisa los productos que has añadido a tu carrito de compras, ajusta cantidades o procede al pago."
        />
        <meta
          property="og:type"
          content="website"
        />
      </Helmet>
    <div className="carrito-page">
      <div className="carrito-main">
        <header className="carrito-topheader">
          <h2>Carrito de Compras</h2>
          <a href="/marketplace" className="carrito-back-link">
            <MdArrowBack style={{ fontSize: '18px' }} />
            Continuar Comprando
          </a>
        </header>

        {cargandoCarrito && (
          <div className="carrito-state">
            <MdHourglassTop className=" carrito-state-icon" />
            <h2>Cargando tu carrito...</h2>
          </div>
        )}

        {!cargandoCarrito && error && (
          <div className="carrito-state">
            <MdError className=" carrito-state-icon" style={{ color: '#ba1a1a' }} />
            <h2>Ocurrió un error</h2>
            <p>{error}</p>
            <button className="carrito-btn-continue" onClick={cargarCarrito}>Reintentar</button>
          </div>
        )}

        {!cargandoCarrito && !error && articulos.length === 0 && (
          <div className="carrito-state">
            <MdShoppingCart className=" carrito-state-icon" />
            <h2>Tu carrito está vacío</h2>
            <p>Aún no has añadido ningún producto. ¡Explora el marketplace!</p>
            <a href="/marketplace" className="carrito-btn-continue">Ir al Marketplace</a>
          </div>
        )}

        {!cargandoCarrito && !error && articulos.length > 0 && (
          <div className="carrito-content">
            <div className="carrito-items-column">
              <h1 className="carrito-section-title">Mi Carrito</h1>
              <p className="carrito-section-subtitle">{articulos.length} {articulos.length === 1 ? 'artículo' : 'artículos'} en tu carrito</p>

              {articulos.map((item) => (
                <div key={item.productId} className="carrito-item">
                  <div className="carrito-item-img">
                    {item.productImageUrl ? (
                      <img 
                        src={item.productImageUrl} 
                        alt={item.productName || `Producto #${item.productId}`} 
                        className="carrito-item-image" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <MdInventory2 />
                    )}
                  </div>

                  <div className="carrito-item-details">
                    <h3 className="carrito-item-name">
                      {item.productName ?? `Producto #${item.productId}`}
                    </h3>
                    <p className="carrito-item-unit-price">Precio unitario: ${item.unitPrice.toFixed(2)}</p>

                    <div className="carrito-item-bottom">
                      <div className="carrito-item-qty">
                        {/* Se quitó el disabled en base a actualizandoId para no bloquear la interacción rápida */}
                        <button 
                          onClick={() => manejarActualizarCantidad(item.productId, item.quantity - 1)}
                          disabled={eliminandoId === item.productId || item.quantity <= 1}
                          title={item.quantity <= 1 ? 'Usa el botón Eliminar para quitar el producto' : 'Disminuir cantidad'}
                        >−</button>
                        <span className="carrito-item-qty-count">{item.quantity}</span>
                        <button 
                          onClick={() => manejarActualizarCantidad(item.productId, item.quantity + 1)}
                          disabled={eliminandoId === item.productId}
                          title="Aumentar cantidad"
                        >+</button>
                      </div>

                      <button
                        className="carrito-item-remove"
                        onClick={() => manejarEliminarItem(item.productId)}
                        disabled={eliminandoId === item.productId || actualizandoId === item.productId}
                      >
                        <MdDelete style={{ fontSize: '18px' }} />
                        {eliminandoId === item.productId ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>

                  <div className="carrito-item-subtotal">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="carrito-summary-column">
              <div className="carrito-summary-card">
                <h2 className="carrito-summary-title">Resumen de Orden</h2>

                {articulos.map((item) => (
                  <div key={item.productId} className="carrito-summary-line">
                    <span>{item.productName ?? `Producto #${item.productId}`} (×{item.quantity})</span>
                    <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="carrito-summary-line">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="carrito-summary-total">
                  <span>Total</span>
                  <span className="carrito-summary-total-amount">${total.toFixed(2)}</span>
                </div>

                <button
                  className="carrito-btn-checkout"
                  onClick={procesarPago}
                  disabled={procesandoPago}
                >
                  <MdLock style={{ fontSize: '20px' }} />
                  {procesandoPago ? 'Procesando pago...' : 'Proceder al Pago'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
