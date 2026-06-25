import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './NotFound.css';
import { Helmet } from 'react-helmet-async';
import { MdArrowBack } from 'react-icons/md';

export default function PaginaNoEncontrada() {
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
        <title>Página no encontrada - Mi Aplicación</title>
        <meta
          name="description"
          content="La ruta que buscás no existe o fue movida. Por favor, verifica la URL o vuelve al inicio."
        />
        <meta
          name="keywords"
          content="Página no encontrada, 404, Error, Ruta inválida, Verificar URL"
        />
        <meta 
          name="author"
          content="Nexo"
        />
        
        {/* Open Graph */}

        <meta
          property="og:title"
          content="Página no encontrada - Mi Aplicación"
        />
        <meta
          property="og:description"
          content="La ruta que buscás no existe o fue movida. Por favor, verifica la URL o vuelve al inicio."
        />
        <meta
          property="og:type"
          content="website"
        />
      </Helmet>
    <div className="not-found-wrapper">
      <div className="not-found-card">
        <p className="not-found-code">404</p>
        <h1 className="not-found-title">Página no encontrada</h1>
        <p className="not-found-description">
          La ruta que buscás no existe o fue movida.
        </p>
        <button className="not-found-btn" onClick={handleVolver}>
          <MdArrowBack />
          Volver al inicio
        </button>
      </div>
    </div>
    </div>
  );
}