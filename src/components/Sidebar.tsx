// Sidebar.jsx
import { useState } from 'react'; // 👈 Añadir useState
import '../styles/Sidebar.css';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const { usuario, cerrarSesion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // 👈 Estado del menú móvil

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  const navLinks = [
    // ... tus enlaces existentes (sin cambios)
    ...(usuario?.rol === 'Administrator' ? [
      { href: '/panel-control',     icon: 'dashboard',   label: 'Dashboard' },
      { href: '/gestion-usuarios',  icon: 'group',       label: 'Usuarios' },
      { href: '/gestion-productos', icon: 'inventory_2', label: 'Productos' },
    ] : []),
    ...(usuario?.rol === 'Seller' ? [
      { href: '/mis-ventas',    icon: 'dashboard',    label: 'Mis Ventas' },
      { href: '/mis-productos', icon: 'inventory_2',  label: 'Mis Productos' },
      { href: '/marketplace',   icon: 'storefront',   label: 'Marketplace' },
      { href: '/mis-pedidos',   icon: 'receipt_long', label: 'Mis Pedidos' },
      { href: '/carrito',       icon: 'shopping_cart',label: 'Carrito' },
    ] : []),
    ...(usuario?.rol === 'Customer' ? [
      { href: '/marketplace',   icon: 'storefront',   label: 'Marketplace' },
      { href: '/mis-pedidos',   icon: 'receipt_long', label: 'Mis Pedidos' },
      { href: '/carrito',       icon: 'shopping_cart',label: 'Carrito' },
    ] : []),
  ];

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/iniciar-sesion');
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
          <span className="material-symbols-outlined">
            {mobileMenuOpen ? 'close' : 'menu'}
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
              <span className="material-symbols-outlined">{link.icon}</span>
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
            <span className="material-symbols-outlined">logout</span>
            <span className="marketplace-sidebar-nav-text">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}