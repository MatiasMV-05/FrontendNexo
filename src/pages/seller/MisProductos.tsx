// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/products';
import type { ProductDto } from '../../types/Producto';
import { useNotification } from '../../contexts/NotificationContext';
import './styles/MisProductos.css';
import { Helmet } from 'react-helmet-async';
import { MdAdd, MdImage, MdEdit, MdDelete } from 'react-icons/md';
import SellerProductModal from './components/SellerProductModal';

type Filtro = 'todos' | 'activos' | 'agotados';

export default function MisProductos() {
  const { usuario } = useAuth();
  const { mostrarNotificacion } = useNotification();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getMyProducts();
      setProducts(response.data || (response as unknown as ProductDto[]));
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario && usuario.rol === 'Seller') loadProducts();
  }, [usuario]);

  // ── Filtro aplicado en memoria ──────────────────────────────────────────
  const productosFiltrados = products.filter((p) => {
    if (filtro === 'activos')  return p.stock > 0;
    if (filtro === 'agotados') return p.stock <= 0;
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: ProductDto) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await productService.deleteProduct(id);
        mostrarNotificacion('Producto eliminado', 'success');
        loadProducts();
      } catch (error) {
        console.error('Error deleting product', error);
        mostrarNotificacion('Error al eliminar el producto.', 'error');
      }
    }
  };

  if (!usuario || usuario.rol !== 'Seller') {
    return <div className="mis-productos-acceso-denegado">Acceso denegado. Solo para Sellers.</div>;
  }

  // Estilos de botón de filtro
  const btnFiltro = (tipo: Filtro): React.CSSProperties => ({
    backgroundColor: filtro === tipo ? '#212529' : 'transparent',
    color: filtro === tipo ? 'white' : '#6c757d',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: filtro === tipo ? 600 : 400,
    transition: 'all 0.2s',
  });

  return (
    <div>
      <Helmet>
        <title>Mis Productos - Mi Aplicación</title>
        <meta name="description" content="Gestiona tus productos en el marketplace. Crea, edita y elimina tus listados de manera sencilla." />
        <meta name="keywords" content="mis productos, seller, marketplace, gestión de productos, inventario" />
        <meta name="author" content="Nexo" />
        <meta property="og:title" content="Mis Productos - Mi Aplicación" />
        <meta property="og:description" content="Gestiona tus productos en el marketplace. Crea, edita y elimina tus listados de manera sencilla." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="mis-productos-main">
        <div className="mis-productos-header-wrapper">
          <header className="mis-productos-header">
            <div>
              <h1 className="mis-productos-title">Mis Productos</h1>
              <p className="mis-productos-subtitle">Gestiona tu inventario y listados del marketplace.</p>
            </div>
            <button className="btn-primary" onClick={handleOpenCreateModal}>
              <MdAdd />
              Nuevo Producto
            </button>
          </header>

          {/* ── Filtros ── */}
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #dee2e6', marginBottom: '24px', display: 'flex', gap: '8px' }}>
            <button style={btnFiltro('todos')} onClick={() => setFiltro('todos')}>
              Todos ({products.length})
            </button>
            <button style={btnFiltro('activos')} onClick={() => setFiltro('activos')}>
              Activos ({products.filter(p => p.stock > 0).length})
            </button>
            <button style={btnFiltro('agotados')} onClick={() => setFiltro('agotados')}>
              Agotados ({products.filter(p => p.stock <= 0).length})
            </button>
          </div>

          {loading ? (
            <div className="p-xl text-center text-outline">Cargando productos...</div>
          ) : productosFiltrados.length === 0 ? (
            <div className="p-xl text-center text-outline">
              {filtro === 'todos' ? 'No tienes productos registrados.' : `No hay productos ${filtro}.`}
            </div>
          ) : (
            <div className="products-grid">
              {productosFiltrados.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock   = product.stock > 0 && product.stock <= 5;
                let badgeClass = 'success';
                let badgeText  = `En Stock (${product.stock})`;
                if (isOutOfStock) { badgeClass = 'danger';  badgeText = 'Agotado (0)'; }
                else if (isLowStock) { badgeClass = 'warning'; badgeText = `Bajo Stock (${product.stock})`; }

                return (
                  <div key={product.id} className="product-card">
                    <div className="product-card-image-container">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className={`product-card-image ${isOutOfStock ? 'grayscale' : ''}`} />
                      ) : (
                        <MdImage style={{ fontSize: '64px', color: '#dee2e6' }} />
                      )}
                      <div className={`product-stock-badge ${badgeClass}`}>{badgeText}</div>
                    </div>
                    <div className="product-card-body">
                      <div className="product-category">{product.category || 'Sin Categoría'}</div>
                      <h3 className="product-name" title={product.name}>{product.name}</h3>
                      <div className="product-price-row">
                        <span className="product-price">${product.price.toFixed(2)}</span>
                      </div>
                      <div className="product-actions">
                        <button className="btn-edit" onClick={() => handleOpenEditModal(product)}>
                          <MdEdit style={{ fontSize: '18px' }} /> Editar
                        </button>
                        <button className="btn-delete" onClick={() => handleDeleteProduct(product.id!)}>
                          <MdDelete style={{ fontSize: '18px' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <SellerProductModal
          isOpen={isModalOpen}
          editingProduct={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onGuardado={loadProducts}
        />
      </div>
    </div>
  );
}