// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ordersService } from '../../services/orders';
import type { OrderResponseDto } from '../../types/Pedido';
import { useNotification } from '../../contexts/NotificationContext';
import './MisPedidos.css';
import { Helmet } from 'react-helmet-async';
import { MdCheckCircle, MdShoppingCart, MdCancel, MdRefresh, MdError, MdReceiptLong, MdExpandMore, MdInventory2 } from 'react-icons/md';
import CancelOrderModal from './components/CancelOrderModal';

export default function MisPedidos() {
  const { } = useAuth();
  const { mostrarNotificacion } = useNotification();
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Pagados' | 'Carrito' | 'Cancelados'>('Todos');
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ordersService.getMyOrders();
      const sorted = (res.data || []).sort((a: OrderResponseDto, b: OrderResponseDto) => b.id - a.id);
      setOrders(sorted);
    } catch (err) {
      setError('No se pudieron cargar los pedidos. Verifica tu conexión.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Pagados') return order.status === 'Paid';
    if (activeFilter === 'Carrito') return order.status === 'Cart';
    if (activeFilter === 'Cancelados') return order.status === 'Cancelled';
    return false;
  });

  const handleCancelOrder = (e: React.MouseEvent, orderId: number) => {
    e.stopPropagation();
    setShowCancelModal(orderId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="mp-badge mp-badge-pagado">
            <MdCheckCircle className=" mp-badge-icon" />
            Pagado
          </span>
        );
      case 'Cart':
        return (
          <span className="mp-badge mp-badge-carrito">
            <MdShoppingCart className=" mp-badge-icon" />
            Carrito
          </span>
        );
      case 'Cancelled':
        return (
          <span className="mp-badge mp-badge-cancelado">
            <MdCancel className=" mp-badge-icon" />
            Cancelado
          </span>
        );
      default:
        return (
          <span className="mp-badge mp-badge-default">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      <Helmet>
        <title>Mis Pedidos - Mi Aplicación</title>
        <meta name="description" content="Consulta tus pedidos realizados en nuestra plataforma. Revisa el estado de cada pedido, los productos adquiridos y gestiona tus compras." />
        <meta name="keywords" content="Mis Pedidos, Compras, Estado de Pedido, Plataforma de Compras, Gestión de Pedidos" />
        <meta name="author" content="Nexo" />
        <meta property="og:title" content="Mis Pedidos - Mi Aplicación" />
        <meta property="og:description" content="Consulta tus pedidos realizados en nuestra plataforma. Revisa el estado de cada pedido, los productos adquiridos y gestiona tus compras." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="mp-contenedor">
        <div className="mp-principal">
          <main className="mp-main">

            {/* Encabezado y filtros */}
            <div className="mp-header-section">
              <h1 className="mp-titulo">Mis Pedidos</h1>
              <div className="mp-filtros">
                {(['Todos', 'Pagados', 'Carrito', 'Cancelados'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`mp-filtro-btn ${activeFilter === filter ? 'activo' : ''}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Cargando */}
            {loading && (
              <div className="mp-estado-centro">
                <MdRefresh className=" mp-spin mp-estado-icono" />
                <p>Cargando tus pedidos...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mp-error">
                <MdError style={{ fontSize: 20 }} />
                {error}
              </div>
            )}

            {/* Tabla */}
            {!loading && !error && (
              <div className="mp-tabla-card">
                <div className="mp-tabla-acento" />
                <div className="mp-tabla-scroll">
                  <table className="mp-tabla">
                    <thead>
                      <tr>
                        <th className="mp-th mp-th-first">#Orden</th>
                        <th className="mp-th">Fecha</th>
                        <th className="mp-th">Productos</th>
                        <th className="mp-th">Total</th>
                        <th className="mp-th">Estado</th>
                        <th className="mp-th mp-th-right mp-th-last">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="mp-vacio">
                            <MdReceiptLong className=" mp-vacio-icono" />
                            <p>No se encontraron pedidos con este filtro.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map(order => {
                          const totalItems = order.orderItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;
                          const totalAmount = order.totalAmount ?? order.orderItems?.reduce((acc, item) => acc + item.subtotal, 0) ?? 0;
                          const isExpanded = expandedRows[order.id];

                          return (
                            <React.Fragment key={order.id}>
                              {/* Fila principal */}
                              <tr className="mp-fila" onClick={() => toggleRow(order.id)}>
                                <td className="mp-td mp-td-first mp-orden-id">ORD-{order.id}</td>
                                <td className="mp-td mp-td-fecha">{formatDate(order.updatedAt)}</td>
                                <td className="mp-td">{totalItems} items</td>
                                <td className="mp-td mp-td-total">${totalAmount.toFixed(2)}</td>
                                <td className="mp-td">{getStatusBadge(order.status)}</td>
                                <td className="mp-td mp-td-last mp-td-right">
                                  <button className="mp-btn-expandir" onClick={(e) => { e.stopPropagation(); toggleRow(order.id); }}>
                                    <MdExpandMore className=" mp-chevron" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                  </button>
                                </td>
                              </tr>

                              {/* Fila expandida */}
                              <tr className="mp-fila-detalle">
                                <td colSpan={6} className="mp-td-detalle-wrapper">
                                  <div className={`mp-detalle-panel ${isExpanded ? 'expandido' : ''}`}>
                                    <div className="mp-detalle-contenido">
                                      <h4 className="mp-detalle-titulo">Artículos</h4>

                                      {!order.orderItems || order.orderItems.length === 0 ? (
                                        <p className="mp-detalle-vacio">No hay artículos en esta orden.</p>
                                      ) : (
                                        <div className="mp-items-lista">
                                          {order.orderItems.map((item, idx) => (
                                            <div key={idx} className="mp-item">
                                              <div className="mp-item-icono">
                                                <MdInventory2 style={{ fontSize: 20 }} />
                                              </div>
                                              <div className="mp-item-info">
                                                <div className="mp-item-nombre">
                                                  {item.productName || `Producto #${item.productId}`}
                                                </div>
                                                <div className="mp-item-detalle">
                                                  Cant: {item.quantity} × ${item.unitPrice.toFixed(2)}
                                                </div>
                                              </div>
                                              <div className="mp-item-subtotal">
                                                ${item.subtotal.toFixed(2)}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      <div className="mp-detalle-footer" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                        {order.status === 'Cart' && (
                                          <a href="/carrito" className="mp-btn-carrito">
                                            Ir al Carrito
                                          </a>
                                        )}
                                        
                                        {(order.status === 'Paid' || order.status === 'Pending') && (
                                          <button 
                                            className="mp-btn-cancelar" 
                                            style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', cursor: 'pointer', fontWeight: 500 }}
                                            onClick={(e) => handleCancelOrder(e, order.id)}
                                          >
                                            Cancelar Pedido
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>

        <CancelOrderModal
          orderId={showCancelModal}
          onClose={() => setShowCancelModal(null)}
          onSuccess={loadOrders}
        />
      </div>
    </div>
  );
}