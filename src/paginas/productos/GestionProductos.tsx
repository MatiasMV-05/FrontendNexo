import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../api/products';
import type { ProductDto } from '../../types/Producto';
import './styles/GestionProductos.css';

// ─── Modal de Crear / Editar ───────────────────────────────────────────────
interface ProductoModalProps {
  producto: ProductDto | null; // null = crear, objeto = editar
  onClose: () => void;
  onGuardado: () => void;
}

function ProductoModal({ producto, onClose, onGuardado }: ProductoModalProps) {
  const modoEdicion = producto !== null;

  const [form, setForm] = useState({
    name: producto?.name ?? '',
    description: producto?.description ?? '',
    price: producto?.price?.toString() ?? '',
    stock: producto?.stock?.toString() ?? '',
    category: producto?.category ?? '',
    imageUrl: producto?.imageUrl ?? '',
  });
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = 'El precio debe ser mayor a 0';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = 'El stock debe ser 0 o mayor';
    if (!form.category.trim()) e.category = 'La categoría es obligatoria';
    return e;
  };

  const handleSubmit = async () => {
    const e = validar();
    if (Object.keys(e).length > 0) { setErrores(e); return; }

    try {
      setGuardando(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
      };

      if (modoEdicion && producto) {
        await productService.updateProduct(producto.id, {
          ...producto,
          ...payload,
        });
      } else {
        await productService.createProduct(payload);
      }
      onGuardado();
    } catch (err: any) {
      const msg =
        err.response?.data?.messages?.[0]?.description ||
        err.response?.data?.data ||
        'Error al guardar el producto';
      alert(`Error: ${msg}`);
    } finally {
      setGuardando(false);
    }
  };

  const campo = (
    label: string,
    key: keyof typeof form,
    tipo: string = 'text',
    placeholder: string = ''
  ) => (
    <div className="gp-modal-campo">
      <label className="gp-modal-label">{label}</label>
      <input
        type={tipo}
        className={`gp-modal-input ${errores[key] ? 'error' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => {
          setForm(f => ({ ...f, [key]: e.target.value }));
          setErrores(er => { const n = { ...er }; delete n[key]; return n; });
        }}
      />
      {errores[key] && <span className="gp-modal-error">{errores[key]}</span>}
    </div>
  );

  return (
    <div className="gp-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="gp-modal">
        <div className="gp-modal-header">
          <h3 className="gp-modal-titulo">
            {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button className="gp-modal-cerrar" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="gp-modal-cuerpo">
          {campo('Nombre *', 'name', 'text', 'Ej: Laptop HP 15')}
          {campo('Descripción', 'description', 'text', 'Descripción del producto')}

          <div className="gp-modal-fila-doble">
            {campo('Precio *', 'price', 'number', '0.00')}
            {campo('Stock *', 'stock', 'number', '0')}
          </div>

          {campo('Categoría *', 'category', 'text', 'Ej: Tecnología')}
          {campo('URL de Imagen', 'imageUrl', 'text', 'https://...')}
        </div>

        <div className="gp-modal-pie">
          <button className="gp-btn-secundario" onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button className="gp-btn-primario" onClick={handleSubmit} disabled={guardando}>
            {guardando ? (
              <>
                <span className="material-symbols-outlined gp-spin" style={{ fontSize: 18 }}>progress_activity</span>
                Guardando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
                {modoEdicion ? 'Guardar Cambios' : 'Crear Producto'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────
export default function GestionProductos() {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalProducto, setModalProducto] = useState<ProductDto | null | undefined>(undefined);
  // undefined = cerrado, null = crear, ProductDto = editar
  const itemsPerPage = 10;

  const loadProductos = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({ pageNumber: 1, pageSize: 200 });
      setProductos(res.data ?? []);
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos;
    const q = busqueda.toLowerCase();
    return productos.filter(
      p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [productos, busqueda]);

  // Reset página al buscar
  useEffect(() => { setCurrentPage(1); }, [busqueda]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const productosPagina = productosFiltrados.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este producto permanentemente?')) return;
    try {
      await productService.deleteProduct(id);
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      const msg =
        err.response?.data?.messages?.[0]?.description ||
        err.response?.data?.data ||
        'Error al eliminar';
      alert(`Error: ${msg}`);
    }
  };

  const handleGuardado = () => {
    setModalProducto(undefined);
    loadProductos();
  };

  if (!usuario || usuario.rol !== 'Administrator') {
    return (
      <div className="gp-acceso-denegado">
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#ba1a1a' }}>block</span>
        <h2>Acceso Denegado</h2>
        <p>Esta sección es exclusiva para Administradores.</p>
      </div>
    );
  }

  return (
    <div className="gp-contenedor">

      <div className="gp-principal">
        {/* Header */}
        <header className="gp-header">
          <h2 className="gp-titulo">Gestión de Productos</h2>

          <div className="gp-busqueda-wrapper">
            <span className="material-symbols-outlined gp-busqueda-icono">search</span>
            <input
              type="text"
              className="gp-busqueda-input"
              placeholder="Buscar por nombre, categoría..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="gp-busqueda-limpiar" onClick={() => setBusqueda('')}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            )}
          </div>

          <button className="gp-btn-primario" onClick={() => setModalProducto(null)}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Nuevo Producto
          </button>
        </header>

        <main className="gp-contenido">
          {/* Stats rápidas */}
          <div className="gp-stats">
            <div className="gp-stat-card">
              <span className="gp-stat-valor">{productos.length}</span>
              <span className="gp-stat-label">Total Productos</span>
            </div>
            <div className="gp-stat-card">
              <span className="gp-stat-valor">{productos.filter(p => p.stock > 0).length}</span>
              <span className="gp-stat-label">En Stock</span>
            </div>
            <div className="gp-stat-card gp-stat-alerta">
              <span className="gp-stat-valor">{productos.filter(p => p.stock === 0).length}</span>
              <span className="gp-stat-label">Sin Stock</span>
            </div>
            <div className="gp-stat-card">
              <span className="gp-stat-valor">
                {[...new Set(productos.map(p => p.category))].length}
              </span>
              <span className="gp-stat-label">Categorías</span>
            </div>
          </div>

          {/* Tabla */}
          <div className="gp-tabla-card">
            <div className="gp-tabla-acento" />

            {loading ? (
              <div className="gp-estado-carga">
                <span className="material-symbols-outlined gp-spin" style={{ fontSize: 36 }}>progress_activity</span>
                <p>Cargando productos...</p>
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="gp-estado-vacio">
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#c7c4d8' }}>inventory_2</span>
                <p>{busqueda ? `Sin resultados para "${busqueda}"` : 'No hay productos registrados'}</p>
                {!busqueda && (
                  <button className="gp-btn-primario" onClick={() => setModalProducto(null)}>
                    Crear primer producto
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="gp-tabla-scroll">
                  <table className="gp-tabla">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th style={{ textAlign: 'right' }}>Precio</th>
                        <th>Stock</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosPagina.map(p => (
                        <tr key={p.id} className="gp-fila">
                          {/* Producto */}
                          <td>
                            <div className="gp-celda-producto">
                              <div className="gp-imagen">
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt={p.name} className="gp-imagen-img" />
                                ) : (
                                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#777587' }}>inventory_2</span>
                                )}
                              </div>
                              <div>
                                <div className="gp-nombre">{p.name}</div>
                                {p.description && (
                                  <div className="gp-descripcion">{p.description.slice(0, 50)}{p.description.length > 50 ? '…' : ''}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Categoría */}
                          <td>
                            <span className="gp-badge-categoria">{p.category || '—'}</span>
                          </td>

                          {/* Precio */}
                          <td style={{ textAlign: 'right' }}>
                            <span className="gp-precio">${Number(p.price).toFixed(2)}</span>
                          </td>

                          {/* Stock */}
                          <td>
                            <span className={`gp-badge-stock ${p.stock === 0 ? 'sin-stock' : p.stock <= 5 ? 'poco-stock' : 'en-stock'}`}>
                              {p.stock === 0 ? 'Sin stock' : p.stock <= 5 ? `¡Solo ${p.stock}!` : `${p.stock} uds`}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td>
                            <div className="gp-acciones">
                              <button
                                className="gp-btn-icono editar"
                                title="Editar producto"
                                onClick={() => setModalProducto(p)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
                              </button>
                              <button
                                className="gp-btn-icono eliminar"
                                title="Eliminar producto"
                                onClick={() => handleEliminar(p.id)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="gp-paginacion">
                    <span className="gp-paginacion-texto">
                      Mostrando {indexOfFirst + 1}–{Math.min(indexOfLast, productosFiltrados.length)} de {productosFiltrados.length} productos
                    </span>
                    <div className="gp-paginacion-controles">
                      <button
                        className="gp-btn-pagina"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(n => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
                        .reduce<(number | '...')[]>((acc, n, i, arr) => {
                          if (i > 0 && (arr[i - 1] as number) + 1 < n) acc.push('...');
                          acc.push(n);
                          return acc;
                        }, [])
                        .map((item, i) =>
                          item === '...' ? (
                            <span key={`dots-${i}`} className="gp-paginacion-dots">…</span>
                          ) : (
                            <button
                              key={item}
                              className={`gp-btn-pagina ${currentPage === item ? 'activo' : ''}`}
                              onClick={() => setCurrentPage(item as number)}
                            >
                              {item}
                            </button>
                          )
                        )}
                      <button
                        className="gp-btn-pagina"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {modalProducto !== undefined && (
        <ProductoModal
          producto={modalProducto}
          onClose={() => setModalProducto(undefined)}
          onGuardado={handleGuardado}
        />
      )}
    </div>
  );
}