// Sidebar.jsx
import { useState } from 'react'; 
import '../styles/Sidebar.css';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { MdLogout, MdClose, MdMenu, MdDashboard, MdGroup, MdInventory2, MdStorefront, MdReceiptLong, MdShoppingCart, MdInfo } from 'react-icons/md';

export default function Sidebar() {
  const { usuario, cerrarSesion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  const navLinks = [
    ...(usuario?.rol === 'Administrator' ? [
      { href: '/panel-control',     icon: MdDashboard,   label: 'Dashboard' },
      { href: '/gestion-usuarios',  icon: MdGroup,       label: 'Usuarios' },
      { href: '/gestion-productos', icon: MdInventory2, label: 'Productos' },
    ] : []),
    ...(usuario?.rol === 'Seller' ? [
      { href: '/mis-ventas',    icon: MdDashboard,    label: 'Mis Ventas' },
      { href: '/mis-productos', icon: MdInventory2,  label: 'Mis Productos' },
      { href: '/marketplace',   icon: MdStorefront,   label: 'Marketplace' },
      { href: '/mis-pedidos',   icon: MdReceiptLong, label: 'Mis Pedidos' },
      { href: '/carrito',       icon: MdShoppingCart,label: 'Carrito' },
    ] : []),
    ...(usuario?.rol === 'Customer' ? [
      { href: '/marketplace',   icon: MdStorefront,   label: 'Marketplace' },
      { href: '/mis-pedidos',   icon: MdReceiptLong, label: 'Mis Pedidos' },
      { href: '/carrito',       icon: MdShoppingCart,label: 'Carrito' },
    ] : []),
    { href: '/app/acerca-de-nosotros', icon: MdInfo, label: 'Acerca de Nosotros' }
  ];

  const handleCerrarSesion = () => {
    navigate('/');
    setTimeout(() => {
      cerrarSesion();
    }, 10);
  };

  // Cerrar menú al hacer clic en un enlace (mejor experiencia)
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <aside className="marketplace-sidebar">
      {/* Cabecera del sidebar (logo + perfil + botón hamburguesa) */}
      <div className="marketplace-sidebar-header">
        <div className="marketplace-sidebar-logo-container">
          <div className="marketplace-sidebar-logo">
            <span>NEXO</span>
          </div>
        </div>

        <Link
          to="/perfil"
          className="marketplace-sidebar-profile"
          style={{ cursor: 'pointer', textDecoration: 'none' }}
          title="Ir al perfil"
        >
          <div className="marketplace-sidebar-avatar">{iniciales}</div>
          <div className="marketplace-sidebar-profile-info">
            <div className="marketplace-sidebar-profile-name">{usuario?.nombre ?? 'Usuario'}</div>
            <div className="marketplace-sidebar-profile-email">{usuario?.email ?? ''}</div>
          </div>
        </Link>

        {/* Botón hamburguesa solo visible en móvil */}
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menú"
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </span>
        </button>
      </div>

      {/* Menú de navegación (se despliega verticalmente en móvil) */}
      <div className={`marketplace-sidebar-nav-container ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <nav className="marketplace-sidebar-nav">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={`marketplace-sidebar-nav-link ${location.pathname === link.href ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}><link.icon size={24} /></span>
              <span className="marketplace-sidebar-nav-text">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="marketplace-sidebar-logout">
          <button
            onClick={() => {
              handleCerrarSesion();
              handleLinkClick();
            }}
            className="marketplace-sidebar-nav-link"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <MdLogout />
            <span className="marketplace-sidebar-nav-text">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}