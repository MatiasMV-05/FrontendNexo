import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './NoAutorizado.css';
import { Helmet } from 'react-helmet-async';
import { MdArrowBack } from 'react-icons/md';

export default function NoAutorizado() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const handleVolver = () => {
    if (!usuario) { navigate('/iniciar-sesion'); return; }
    if (usuario.rol === 'Administrator') { navigate('/panel-control'); return; }
    navigate('/marketplace');
  };

  return (
    <div>
      <Helmet>
        <title>Acceso Denegado - Mi Aplicación</title>
        <meta
          name="description"
          content="No tienes permisos suficientes para acceder a esta ruta. Por favor, inicia sesión o contacta al administrador."
        />
        <meta
          name="keywords"
          content="Acceso Denegado, 403, Permisos, Seguridad, Autenticación"
        />
        <meta 
          name="author"
          content="Nexo"
        />

        {/* Open Graph */}

        <meta
          property="og:title"
          content="Acceso Denegado - Mi Aplicación"
        />
        <meta
          property="og:description"
          content="No tienes permisos suficientes para acceder a esta ruta. Por favor, inicia sesión o contacta al administrador."
        />
        <meta
          property="og:type"
          content="website"
        />
      </Helmet>
    <div className="no-autorizado-wrapper">
      <div className="no-autorizado-card">
        <p className="no-autorizado-code">403</p>
        <h1 className="no-autorizado-title">Acceso Denegado</h1>
        <p className="no-autorizado-description">
          No tienes permisos suficientes para acceder a esta ruta.
        </p>
        <button className="no-autorizado-btn" onClick={handleVolver}>
          <MdArrowBack />
          Volver al inicio
        </button>
      </div>
    </div>
    </div>
  );
}
