import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ordersService } from '../../services/orders';
import { productService } from '../../services/products';
import type { OrderResponseDto } from '../../types/Pedido';
import type { ProductDto } from '../../types/Producto';
import './styles/MisVentas.css';
import { Helmet } from 'react-helmet-async';
import { MdPayments, MdShoppingCartCheckout, MdInventory } from 'react-icons/md';

export default function MisVentas() {
  const { usuario } = useAuth();
  const [sales, setSales] = useState<OrderResponseDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesResponse, productsResponse] = await Promise.all([
          ordersService.getMySales(),
          productService.getMyProducts()
        ]);
        
        // Handling response payload based on the API definition
        setSales(salesResponse.data || (salesResponse as unknown as OrderResponseDto[]));
        setProducts(productsResponse.data || (productsResponse as unknown as ProductDto[]));
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    if (usuario && usuario.rol === 'Seller') {
      fetchData();
    }
  }, [usuario]);

  // Derived Statistics
  const totalEarnings = useMemo(() => {
    return sales.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
  }, [sales]);

  const productsSold = useMemo(() => {
    return sales.reduce((acc, order) => {
      const orderQuantity = order.orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      return acc + orderQuantity;
    }, 0);
  }, [sales]);

  const activeProducts = useMemo(() => {
    // Only count products with stock > 0
    return products.filter(p => p.stock > 0).length;
  }, [products]);

  // Flattened Order Items for Recent Sales Table
  const recentSalesItems = useMemo(() => {
    const items: Array<{
      date: string;
      buyer: string; // Since we don't have buyer detail in DTO, we mock it or use order user id
      productName: string;
      quantity: number;
      subtotal: number;
      status: string;
    }> = [];

    // Sort orders by most recent
    const sortedOrders = [...sales].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    sortedOrders.forEach(order => {
      order.orderItems?.forEach(item => {
        items.push({
          date: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
          buyer: `User_${order.userId}`,
          productName: item.productName || `Product #${item.productId}`,
          quantity: item.quantity,
          subtotal: item.subtotal || (item.unitPrice * item.quantity),
          status: order.status || 'Completed'
        });
      });
    });

    return items.slice(0, 5); // Take top 5 for the dashboard
  }, [sales]);

  if (!usuario || usuario.rol !== 'Seller') {
    return <div className="mis-ventas-acceso-denegado">Acceso denegado. Solo para Sellers.</div>;
  }

  return (
    <div>
      <Helmet>
        <title>Mis Ventas - Mi Aplicación</title>
        <meta
          name="description"
          content="Visualiza tus ventas recientes, ganancias y productos activos en tu panel de vendedor."
        />
        <meta
          name="keywords"
          content="Mis Ventas, Seller Dashboard, Ganancias, Productos Activos, Ventas Recientes"
        />
        <meta 
          name="author"
          content="Nexo"
        />

        {/* Open Graph */}

        <meta
          property="og:title"
          content="Mis Ventas - Mi Aplicación"
        />
        <meta
          property="og:description"
          content="Visualiza tus ventas recientes, ganancias y productos activos en tu panel de vendedor."
        />
        <meta
          property="og:type"
          content="website"
        />
      </Helmet>
    <div className="seller-dashboard-wrapper">

      <div className="seller-main-content">
        <main className="mis-ventas-container">
          {/* Header Section */}
          <header className="mis-ventas-header">
            <div>
              <h2 className="mis-ventas-title">Mis Ventas</h2>
              <p className="mis-ventas-subtitle">Bienvenido de nuevo, {usuario.nombre}</p>
            </div>
          </header>

          {/* Summary Row */}
          <div className="mis-ventas-summary-grid">
            {/* Total Earnings */}
            <div className="summary-card">
              <div className="summary-card-indicator primary"></div>
              <div className="summary-card-header">
                <p className="summary-card-title">Ganancias</p>
                <div className="summary-card-icon primary">
                  <MdPayments />
                </div>
              </div>
              <div>
                <h3 className="summary-card-value">${totalEarnings.toFixed(2)}</h3>
              </div>
            </div>

            {/* Products Sold */}
            <div className="summary-card">
              <div className="summary-card-indicator secondary"></div>
              <div className="summary-card-header">
                <p className="summary-card-title">Productos Vendidos</p>
                <div className="summary-card-icon secondary">
                  <MdShoppingCartCheckout />
                </div>
              </div>
              <div>
                <h3 className="summary-card-value">{productsSold}</h3>
              </div>
            </div>

            {/* Active Products */}
            <div className="summary-card">
              <div className="summary-card-indicator blue"></div>
              <div className="summary-card-header">
                <p className="summary-card-title">Productos Activos</p>
                <div className="summary-card-icon blue">
                  <MdInventory />
                </div>
              </div>
              <div>
                <h3 className="summary-card-value">{activeProducts}</h3>
              
              </div>
            </div>
          </div>

          {/* Layout Grid for Table and Widgets */}
          <div className="mis-ventas-layout-grid">
            {/* Main Content Area: Sales Table */}
            <div className="sales-table-card">
              <div className="sales-table-indicator"></div>
              <div className="sales-table-header">
                <h3 className="sales-table-title">Recent Sales</h3>
                <button className="sales-table-view-all">View All</button>
              </div>
              
              {loading ? (
                <div className="p-xl text-center text-outline">Cargando ventas...</div>
              ) : recentSalesItems.length === 0 ? (
                <div className="p-xl text-center text-outline">No hay ventas recientes.</div>
              ) : (
                <div className="table-container">
                  <table className="sales-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Buyer</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSalesItems.map((item, index) => (
                        <tr key={index}>
                          <td className="td-muted">{item.date}</td>
                          <td className="td-muted">{item.buyer}</td>
                          <td className="td-bold">{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td className="td-bold">${item.subtotal.toFixed(2)}</td>
                          <td>
                            <span className={`status-badge ${item.status.toLowerCase()}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sidebar/Widget Area */}
            <div className="widgets-column">
              
            </div>
          </div>
        </main>
      </div>
    </div>
    </div>
  );
}
