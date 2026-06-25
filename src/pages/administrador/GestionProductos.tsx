// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/products';
import type { ProductDto } from '../../types/Producto';
import { useNotification } from '../../contexts/NotificationContext';
import './styles/GestionProductos.css';
import { Helmet } from 'react-helmet-async';
import { MdClose, MdRefresh, MdSave, MdBlock, MdSearch, MdAdd, MdInventory2, MdEdit, MdDelete, MdChevronLeft, MdChevronRight } from 'react-icons/md';

import ProductModal from './components/ProductModal';
// ─── Componente Principal ──────────────────────────────────────────────────
export default function GestionProductos() {
  const { usuario } = useAuth();
  const { mostrarNotificacion } = useNotification();
  const [productos, setProductos] = useState<ProductDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalProducto, setModalProducto] = useState<ProductDto | null | undefined>(undefined);
  // undefined = cerrado, null = crear, ProductDto = editar
  const elementosPorPagina = 10;

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const res = await productService.getProducts({ pageNumber: 1, pageSize: 200 });
      setProductos(res.data ?? []);
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
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

  // Reiniciar página al buscar
  useEffect(() => { setPaginaActual(1); }, [busqueda]);

  const indiceFinal = paginaActual * elementosPorPagina;
  const indiceInicial = indiceFinal - elementosPorPagina;
  const productosPagina = productosFiltrados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(productosFiltrados.length / elementosPorPagina);

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este producto permanentemente?')) return;
    try {
      await productService.deleteProduct(id);
      setProductos(prev => prev.filter(p => p.id !== id));
      mostrarNotificacion('Producto eliminado', 'success');
    } catch (err: any) {
      const msg =
        err.response?.data?.messages?.[0]?.description ||
        err.response?.data?.data ||
        'Error al eliminar';
      mostrarNotificacion(`Error: ${msg}`, 'error');
    }
  };

  const handleGuardado = () => {
    setModalProducto(undefined);
    cargarProductos();
  };

  if (!usuario || usuario.rol !== 'Administrator') {
    return (
      <div className="gp-acceso-denegado">
        <MdBlock style={{ fontSize: 48, color: '#ba1a1a' }} />
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
            <MdSearch className=" gp-busqueda-icono" />
            <input
              type="text"
              className="gp-busqueda-input"
              placeholder="Buscar por nombre, categoría..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="gp-busqueda-limpiar" onClick={() => setBusqueda('')}>
                <MdClose style={{ fontSize: 18 }} />
              </button>
            )}
          </div>

          <button className="gp-btn-primario" onClick={() => setModalProducto(null)}>
            <MdAdd style={{ fontSize: 18 }} />
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

            {cargando ? (
              <div className="gp-estado-carga">
                <MdRefresh className=" gp-spin" style={{ fontSize: 36 }} />
                <p>Cargando productos...</p>
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="gp-estado-vacio">
                <MdInventory2 style={{ fontSize: 48, color: '#c7c4d8' }} />
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
                                  <MdInventory2 style={{ fontSize: 22, color: '#777587' }} />
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
                                <MdEdit style={{ fontSize: 20 }} />
                              </button>
                              <button
                                className="gp-btn-icono eliminar"
                                title="Eliminar producto"
                                onClick={() => handleEliminar(p.id)}
                              >
                                <MdDelete style={{ fontSize: 20 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div className="gp-paginacion">
                    <span className="gp-paginacion-texto">
                      Mostrando {indiceInicial + 1}–{Math.min(indiceFinal, productosFiltrados.length)} de {productosFiltrados.length} productos
                    </span>
                    <div className="gp-paginacion-controles">
                      <button
                        className="gp-btn-pagina"
                        disabled={paginaActual === 1}
                        onClick={() => setPaginaActual(p => p - 1)}
                      >
                        <MdChevronLeft style={{ fontSize: 18 }} />
                      </button>
                      {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                        .filter(n => n === 1 || n === totalPaginas || Math.abs(n - paginaActual) <= 1)
                        .reduce<(number | '...')[]>((acc, n, i, arr) => {
                          if (i > 0 && (arr[i - 1] as number) + 1 < n) acc.push('...');
                          acc.push(n);
                          return acc;
                        }, [])
                        .map((item, i) =>
                          item === '...' ? (
                            <span key={`puntos-${i}`} className="gp-paginacion-dots">…</span>
                          ) : (
                            <button
                              key={item}
                              className={`gp-btn-pagina ${paginaActual === item ? 'activo' : ''}`}
                              onClick={() => setPaginaActual(item as number)}
                            >
                              {item}
                            </button>
                          )
                        )}
                      <button
                        className="gp-btn-pagina"
                        disabled={paginaActual === totalPaginas}
                        onClick={() => setPaginaActual(p => p + 1)}
                      >
                        <MdChevronRight style={{ fontSize: 18 }} />
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
        <ProductModal
          producto={modalProducto}
          onClose={() => setModalProducto(undefined)}
          onGuardado={handleGuardado}
        />
      )}
    </div>
  );
}