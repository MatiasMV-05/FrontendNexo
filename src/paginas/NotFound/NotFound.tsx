import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './NotFound.css';

export default function PaginaNoEncontrada() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const handleVolver = () => {
    if (!usuario) { navigate('/iniciar-sesion'); return; }
    if (usuario.rol === 'Administrator') { navigate('/panel-control'); return; }
    navigate('/marketplace');
  };

  return (
    <div className="not-found-wrapper">
      <div className="not-found-card">
        <p className="not-found-code">404</p>
        <h1 className="not-found-title">Página no encontrada</h1>
        <p className="not-found-description">
          La ruta que buscás no existe o fue movida.
        </p>
        <button className="not-found-btn" onClick={handleVolver}>
          <span className="material-symbols-outlined">arrow_back</span>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}