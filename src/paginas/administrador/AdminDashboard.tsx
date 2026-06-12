import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async'; // 👈 Importa Helmet
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../api/admin';
import type {
  BoardStatsResponse,
  ReporteMensualVentasResponse,
  TopProductosVendidosResponse,
  TopUsersBySpendingResponse
} from '../../api/admin';
import './styles/AdminDashboard.css';

export default function PanelAdministrador() {
  const { usuario } = useAuth();

  const [estadisticasPanel, setEstadisticasPanel] = useState<BoardStatsResponse | null>(null);
  const [ventasMensuales, setVentasMensuales]     = useState<ReporteMensualVentasResponse[]>([]);
  const [topProductos, setTopProductos]           = useState<TopProductosVendidosResponse[]>([]);
  const [topUsuarios, setTopUsuarios]             = useState<TopUsersBySpendingResponse[]>([]);
  const [cargando, setCargando]                   = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [statsRes, ventasRes, productosRes, usuariosRes] = await Promise.all([
          adminService.getBoardStats(),
          adminService.getMonthlySales(),
          adminService.getTopProducts(),
          adminService.getTopUsers()
        ]);
        setEstadisticasPanel(Array.isArray(statsRes) && statsRes.length > 0 ? statsRes[0] : null);
        setVentasMensuales(Array.isArray(ventasRes) ? ventasRes : []);
        setTopProductos(Array.isArray(productosRes) ? productosRes : []);
        setTopUsuarios(Array.isArray(usuariosRes) ? usuariosRes : []);
      } catch (error) {
        console.error('Error al cargar datos del panel', error);
      } finally {
        setCargando(false);
      }
    };

    if (usuario?.rol === 'Administrator') cargarDatos();
  }, [usuario]);

  if (!usuario || usuario.rol !== 'Administrator') {
    return (
      <>
        <Helmet>
          <title>Acceso Denegado | Nexo Admin</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="panel-acceso-denegado">Acceso denegado. Solo para Administradores.</div>
      </>
    );
  }

  const formatearMoneda = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(v || 0);

  const formatearNumero = (v: number) =>
    new Intl.NumberFormat('es-ES').format(v || 0);

  const maxVentas = topProductos.length > 0
    ? Math.max(...topProductos.map(p => p.TotalVendido))
    : 1;

  /* ── puntos del gráfico de línea SVG (últimos 6 meses) ── */
  const ultimos6 = ventasMensuales.slice(-6);
  const maxIngreso = ultimos6.length > 0
    ? Math.max(...ultimos6.map(v => Number(v.IngresosTotales || 0)), 1)
    : 1;

  const puntosLinea = ultimos6.map((v, i) => {
    const x = ultimos6.length === 1 ? 50 : (i / (ultimos6.length - 1)) * 100;
    const y = 90 - (Number(v.IngresosTotales || 0) / maxIngreso) * 80;
    return `${x},${y}`;
  }).join(' ');

  const puntosArea = ultimos6.length > 0
    ? `0,100 ${puntosLinea} 100,100`
    : '0,100 0,90 100,90 100,100';

  // Construir título dinámico (opcional)
  const tituloPagina = estadisticasPanel
    ? `Dashboard - Ventas ${formatearMoneda(estadisticasPanel.IngresosTotales)} | Nexo Admin`
    : 'Panel de Administración | Nexo';

  const descripcionPagina = `Panel de control con estadísticas: ${formatearNumero(estadisticasPanel?.TotalOrdenes || 0)} órdenes, ${formatearNumero(estadisticasPanel?.TotalUsuarios || 0)} usuarios, y productos más vendidos.`;

  return (
    <>
      <Helmet>
        {/* Metadatos básicos */}
        <title>{tituloPagina}</title>
        <meta name="description" content={descripcionPagina} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={window.location.href} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={tituloPagina} />
        <meta property="og:description" content={descripcionPagina} />
        <meta property="og:image" content="/logo-nexo-og.png" /> {/* Ajusta la ruta a tu imagen */}
        <meta property="og:url" content={window.location.href} />
        <meta property="og:site_name" content="Nexo Marketplace" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={tituloPagina} />
        <meta name="twitter:description" content={descripcionPagina} />
        <meta name="twitter:image" content="/logo-nexo-twitter.png" /> {/* Ajusta */}

        {/* Evitar indexación si es entorno de desarrollo o privado (opcional) */}
        {/* <meta name="robots" content="noindex, nofollow" /> */}
      </Helmet>

      <main className="panel-contenedor">
        {/* ... el resto de tu JSX se mantiene igual ... */}
        <header className="panel-encabezado">
          {/* ... */}
        </header>
        <div className="panel-cuerpo">
          {/* ... */}
        </div>
      </main>
    </>
  );
}