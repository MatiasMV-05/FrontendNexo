import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../pages/landing/styles/Home.css';
import { useAuth } from '../contexts/AuthContext';
import { MdClose, MdMenu } from 'react-icons/md';

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="home-header" style={{ position: 'relative', zIndex: 100 }}>
      <div className="home-header-container">
        {/* Brand */}
        <div className="home-brand">
          <Link to="/" className="home-brand-text" style={{ 
            textDecoration: 'none', 
            fontFamily: "'Plus Jakarta Sans', sans-serif", 
            fontWeight: 900, 
            letterSpacing: '0.15em', 
            textTransform: 'uppercase', 
            background: 'linear-gradient(135deg, #4d41df 0%, #a39cf4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 4px rgba(77, 65, 223, 0.2))'
          }}>
            NEXO
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="home-nav">
          <Link to="/" className={`home-nav-link ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
          <Link to="/catalogo" className={`home-nav-link ${location.pathname === '/catalogo' ? 'active' : ''}`}>Catálogo</Link>
          <Link to="/acerca-de-nosotros" className={`home-nav-link ${location.pathname === '/acerca-de-nosotros' ? 'active' : ''}`}>Acerca de Nosotros</Link>
        </nav>

        {/* Actions */}
        <div className="home-actions">
          <div className="home-auth-buttons">
            {usuario ? (
              <button
                className="btn-register"
                onClick={() => navigate('/marketplace')}
              >
                Ir al Marketplace
              </button>
            ) : (
              <>
                <button
                  className="btn-login"
                  onClick={() => navigate('/iniciar-sesion')}
                >
                  Iniciar Sesión
                </button>
                <button
                  className="btn-register"
                  onClick={() => navigate('/registro')}
                >
                  Registrarse
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            aria-label="Menu"
            className="home-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="home-mobile-dropdown">
          <nav className="home-mobile-nav">
            <Link to="/" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
            <Link to="/catalogo" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Catálogo</Link>
            <Link to="/acerca-de-nosotros" className="home-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Acerca de Nosotros</Link>
          </nav>
          <div className="home-mobile-auth">
            {usuario ? (
              <button className="btn-register" onClick={() => { navigate('/marketplace'); setMobileMenuOpen(false); }}>
                Ir al Marketplace
              </button>
            ) : (
              <>
                <button className="btn-login" onClick={() => { navigate('/iniciar-sesion'); setMobileMenuOpen(false); }}>
                  Iniciar Sesión
                </button>
                <button className="btn-register" onClick={() => { navigate('/registro'); setMobileMenuOpen(false); }}>
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
