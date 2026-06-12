import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../api/products';
import type { ProductDto } from '../../types/Producto';
import './styles/MisProductos.css';

type Filtro = 'todos' | 'activos' | 'agotados';

export default function MisProductos() {
  const { usuario } = useAuth();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', stock: '', imageUrl: ''
  });

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
    setFormData({ name: '', description: '', price: '', category: '', stock: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: ProductDto) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? product.price.toString() : '0',
      category: product.category || '',
      stock: product.stock ? product.stock.toString() : '0',
      imageUrl: product.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock, 10),
        imageUrl: formData.imageUrl
      };
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id!, { ...editingProduct, ...payload });
        alert('Producto actualizado correctamente');
      } else {
        await productService.createProduct(payload);
        alert('Producto creado correctamente');
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product', error);
      alert('Error al guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await productService.deleteProduct(id);
        alert('Producto eliminado');
        loadProducts();
      } catch (error) {
        console.error('Error deleting product', error);
        alert('Error al eliminar el producto.');
      }
    }
  };

  if (!usuario || usuario.rol !== 'Seller') {
    return <div className="p-xl text-center">Acceso denegado. Solo para Sellers.</div>;
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
    <div className="mis-productos-main">
      <div className="mis-productos-header-wrapper">
        <header className="mis-productos-header">
          <div>
            <h1 className="mis-productos-title">Mis Productos</h1>
            <p className="mis-productos-subtitle">Gestiona tu inventario y listados del marketplace.</p>
          </div>
          <button className="btn-primary" onClick={handleOpenCreateModal}>
            <span className="material-symbols-outlined">add</span>
            Nuevo Producto
          </button>
        </header>

        {/* ── Filtros ── */}
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #dee2e6', marginBottom: '24px', display: 'flex', gap: '8px' }}>
          <button style={btnFiltro('todos')}    onClick={() => setFiltro('todos')}>
            Todos ({products.length})
          </button>
          <button style={btnFiltro('activos')}  onClick={() => setFiltro('activos')}>
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
                      <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#dee2e6' }}>image</span>
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
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span> Editar
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteProduct(product.id!)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Nombre</label>
                  <input required className="form-input" id="name" name="name" type="text" value={formData.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="description">Descripción</label>
                  <textarea required className="form-input" id="description" name="description" rows={3} value={formData.description} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="price">Precio ($)</label>
                    <input required min="0.01" step="0.01" className="form-input" id="price" name="price" type="number" value={formData.price} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="stock">Stock</label>
                    <input required min="0" className="form-input" id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Categoría</label>
                  <select required className="form-input" id="category" name="category" value={formData.category} onChange={handleChange}>
                    <option value="" disabled>Seleccione una categoría</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Muebles">Muebles</option>
                    <option value="Hogar">Hogar</option>
                    <option value="Ropa">Ropa y Accesorios</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Libros">Libros y Educación</option>
                    <option value="Alimentos">Alimentos</option>
                    <option value="Salud">Salud y Belleza</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="imageUrl">URL de la Imagen</label>
                  <input className="form-input" id="imageUrl" name="imageUrl" type="url" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={isSaving}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}