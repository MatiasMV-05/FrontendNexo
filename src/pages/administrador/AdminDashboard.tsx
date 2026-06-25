// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/admin';
import { Helmet } from 'react-helmet-async';

import type {
  BoardStatsResponse,
  ReporteMensualVentasResponse,
  TopProductosVendidosResponse,
  TopUsersBySpendingResponse,
  LowStockProductResponse
} from '../../services/admin';
import './styles/AdminDashboard.css';
import { MdMenu, MdError, MdPayments, MdGroup } from 'react-icons/md';


export default function PanelAdministrador() {
  const { usuario } = useAuth();

  const [estadisticasPanel, setEstadisticasPanel] = useState<BoardStatsResponse | null>(null);
  const [ventasMensuales, setVentasMensuales]     = useState<ReporteMensualVentasResponse[]>([]);
  const [topProductos, setTopProductos]           = useState<TopProductosVendidosResponse[]>([]);
  const [topUsuarios, setTopUsuarios]             = useState<TopUsersBySpendingResponse[]>([]);
  const [productosBajoStock, setProductosBajoStock] = useState<LowStockProductResponse[]>([]);
  const [cargando, setCargando]                   = useState(true);
  const [errorPanel, setErrorPanel]               = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [statsRes, ventasRes, productosRes, usuariosRes, stockRes] = await Promise.all([
          adminService.getBoardStats(),
          adminService.getMonthlySales(),
          adminService.getTopProducts(),
          adminService.getTopUsers(),
          adminService.getLowStockProducts()
        ]);
        setEstadisticasPanel(Array.isArray(statsRes) && statsRes.length > 0 ? statsRes[0] : null);
        setVentasMensuales(Array.isArray(ventasRes) ? ventasRes : []);
        setTopProductos(Array.isArray(productosRes) ? productosRes : []);
        setTopUsuarios(Array.isArray(usuariosRes) ? usuariosRes : []);
        setProductosBajoStock(Array.isArray(stockRes) ? stockRes : []);
      } catch (error: any) {
        const msg = error?.response?.data?.Messages?.[0]?.Description
          || error?.response?.data?.message
          || error?.message
          || 'Error al conectar con el servidor';
        setErrorPanel(`Error cargando datos: ${msg}`);
        console.error('Error al cargar datos del panel', error);
      } finally {
        setCargando(false);
      }
    };

    if (usuario?.rol === 'Administrator') cargarDatos();
  }, [usuario]);

  if (!usuario || usuario.rol !== 'Administrator') {
    return <div className="panel-acceso-denegado">Acceso denegado. Solo para Administradores.</div>;
  }

  const formatearMoneda = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(v || 0);

  const formatearNumero = (v: number) =>
    new Intl.NumberFormat('es-ES').format(v || 0);

  const maxVentas = topProductos.length > 0
    ? Math.max(...topProductos.map(p => p.totalVendido))
    : 1;

  /* ── puntos del gráfico de línea SVG (últimos 6 meses) ── */
  const ultimos6 = ventasMensuales.slice(-6);
  const maxIngreso = ultimos6.length > 0
    ? Math.max(...ultimos6.map(v => Number(v.ingresosTotales || 0)), 1)
    : 1;

  const puntosLinea = ultimos6.map((v, i) => {
    const x = ultimos6.length === 1 ? 50 : (i / (ultimos6.length - 1)) * 100;
    const y = 90 - (Number(v.ingresosTotales || 0) / maxIngreso) * 80;
    return `${x},${y}`;
  }).join(' ');

  const puntosArea = ultimos6.length > 0
    ? `0,100 ${puntosLinea} 100,100`
    : '0,100 0,90 100,90 100,100';

  return (



    <main className="panel-contenedor">

      <Helmet>
        <title>Administrador - DashBoard</title>

        <meta 
        name="description" 
        content="Panel de administración de Nexo. Visualiza estadísticas, ventas, productos y usuarios." 
        />

        <meta
          name="keywords"
          content="Administrador, DashBoard, Nexo, estadísticas, ventas, productos, usuarios"
        />

        <meta
          name="author"
          content="Matias Moron"
        />

        {/* Open Graph */}

        <meta
          property="og:title"
          content="Administrador - DashBoard"
        />

        <meta
          property="og:description"
          content="Panel de administración de Nexo. Visualiza estadísticas, ventas, productos y usuarios."
        />

        <meta
          property="og:type"
          content="website"
        />


      </Helmet>

      {/* ── Encabezado ── */}
      <header className="panel-encabezado">
        <div className="panel-encabezado-izq">
          <button className="panel-boton-menu" aria-label="Abrir menú">
            <MdMenu />
          </button>
          <span className="panel-titulo-movil">Nexo Admin</span>
        </div>
        <h2 className="panel-titulo-escritorio">DashBoard</h2>
        <div />
      </header>

      {/* ── Contenido ── */}
      <div className="panel-cuerpo">

      {cargando ? (
          <div className="panel-cargando">Cargando datos del sistema...</div>
        ) : errorPanel ? (
          <div style={{ padding: '32px', background: '#fee2e2', borderRadius: '12px', color: '#b91c1c', fontWeight: 500, margin: '24px' }}>
            <MdError style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8 }} />
            {errorPanel}
          </div>
        ) : (
          <>
            {/* ── KPIs ── */}
            <section className="panel-kpis">

              <div className="kpi-tarjeta">
                <div className="kpi-borde kpi-borde--primario" />
                <div className="kpi-fila-superior">
                  <div>
                    <p className="kpi-etiqueta">Ventas Totales</p>
                    <h3 className="kpi-valor">{formatearMoneda(estadisticasPanel?.ingresosTotales || 0)}</h3>
                  </div>
                  <div className="kpi-icono kpi-icono--primario">
                    <MdPayments />
                  </div>
                </div>
              </div>

              <div className="kpi-tarjeta">
                <div className="kpi-borde kpi-borde--secundario" />
                <div className="kpi-fila-superior">
                  <div>
                    <p className="kpi-etiqueta">Usuarios Totales</p>
                    <h3 className="kpi-valor">{formatearNumero(estadisticasPanel?.totalUsuarios || 0)}</h3>
                  </div>
                  <div className="kpi-icono kpi-icono--secundario">
                    <MdGroup />
                  </div>
                </div>
              </div>

              <div className="kpi-tarjeta">
                <div className="kpi-borde kpi-borde--terciario" />
                <div className="kpi-fila-superior">
                  <div>
                    <p className="kpi-etiqueta">Órdenes Totales</p>
                    <h3 className="kpi-valor">{formatearNumero(estadisticasPanel?.totalOrdenes || 0)}</h3>
                  </div>
                </div>
              </div>

            </section>

            {/* ── Gráficos ── */}
            <section className="panel-graficos">

              {/* Ingresos mensuales */}
              <div className="grafico-tarjeta grafico-tarjeta--ancho">
                <div className="grafico-borde grafico-borde--primario" />
                <div className="grafico-encabezado">
                  <h3 className="grafico-titulo">Ingresos Mensuales</h3>
                </div>

                <div className="grafico-area-linea">
                  {/* etiquetas Y */}
                  <div className="grafico-eje-y">
                    <span>$150k</span>
                    <span>$100k</span>
                    <span>$50k</span>
                    <span>$0</span>
                  </div>
                  {/* SVG */}
                  <div className="grafico-svg-contenedor">
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="grafico-svg"
                    >
                      {/* área rellena */}
                      <polygon
                        points={puntosArea}
                        className="grafico-area-relleno"
                      />
                      {/* línea */}
                      {ultimos6.length > 1 && (
                        <polyline
                          points={puntosLinea}
                          fill="none"
                          className="grafico-linea"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                      )}
                    </svg>
                    {/* borde inferior */}
                    <div className="grafico-borde-inferior" />
                  </div>
                </div>

                {/* etiquetas X */}
                <div className="grafico-eje-x">
                  {ultimos6.map((v, i) => (
                    <span key={i}>{String(v.nombreMes).substring(0, 3)}</span>
                  ))}
                </div>
              </div>

            </section>

            {/* ── Top productos y Bajo Stock ── */}
            <section className="panel-graficos" style={{ marginTop: '24px' }}>
              {/* Top productos */}
              <div className="grafico-tarjeta">
                <div className="grafico-borde grafico-borde--secundario" />
                <div className="grafico-encabezado">
                  <h3 className="grafico-titulo">Productos más vendidos</h3>
                </div>
                <div className="productos-lista">
                  {topProductos.slice(0, 5).map((p, i) => (
                    <div key={i} className="productos-item">
                      <div className="productos-fila">
                        <span className="productos-nombre">{p.name}</span>
                        <span className="productos-cantidad">{formatearNumero(p.totalVendido)} uds.</span>
                      </div>
                      <div className="productos-barra-fondo">
                        <div
                          className="productos-barra-relleno"
                          style={{ width: `${(p.totalVendido / maxVentas) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Productos bajo stock */}
              <div className="grafico-tarjeta">
                <div className="grafico-borde grafico-borde--terciario" />
                <div className="grafico-encabezado">
                  <h3 className="grafico-titulo">Productos bajo stock</h3>
                </div>
                <div className="productos-lista">
                  {productosBajoStock.length === 0 ? (
                    <div style={{ padding: '1rem', color: '#6b7280', textAlign: 'center' }}>
                      No hay productos con bajo stock.
                    </div>
                  ) : (
                    productosBajoStock.slice(0, 5).map((p, i) => (
                      <div key={i} className="productos-item">
                        <div className="productos-fila">
                          <span className="productos-nombre">{p.name}</span>
                          <span className="productos-cantidad" style={{ color: p.stock === 0 ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>
                            {p.stock} uds.
                          </span>
                        </div>
                        <div className="productos-barra-fondo">
                          <div
                            className="productos-barra-relleno"
                            style={{ 
                              width: `${Math.max((p.stock / 10) * 100, 5)}%`, 
                              background: p.stock === 0 ? '#ef4444' : '#f59e0b' 
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* ── Tabla top gastadores ── */}
            <section className="tabla-seccion">
              <div className="tabla-tarjeta">
                <div className="tabla-borde" />
                <div className="tabla-encabezado">
                  <h3 className="tabla-titulo">Usuarios que más gastan</h3>
                </div>
                <div className="tabla-desbordamiento">
                  <table className="tabla">
                    <thead>
                      <tr className="tabla-fila-encabezado">
                        <th className="tabla-th tabla-th--izquierda">Cliente</th>
                        <th className="tabla-th">Órdenes</th>
                        <th className="tabla-th tabla-th--derecha">Total Gastado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topUsuarios.slice(0, 5).map((u, i) => {
                        const iniciales = String(u.name)
                          .split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                        const claseAvatar =
                          i % 3 === 0 ? 'avatar--primario'
                          : i % 3 === 1 ? 'avatar--secundario'
                          : 'avatar--terciario';
                        return (
                          <tr key={i} className="tabla-fila">
                            <td className="tabla-td tabla-td--izquierda">
                              <div className="tabla-usuario">
                                <div className={`tabla-avatar ${claseAvatar}`}>{iniciales}</div>
                                <span className="tabla-nombre">{u.name}</span>
                              </div>
                            </td>
                            <td className="tabla-td tabla-td--ordenes">{u.totalOrdenes}</td>
                            <td className="tabla-td tabla-td--gastado">
                              {formatearMoneda(Number(u.totalGastado || 0))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}