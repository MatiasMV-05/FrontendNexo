// @ts-nocheck
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { usersService } from '../../../services/users';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';
import './styles/DeleteAccountModal.css';

interface DeleteAccountModalProps {
  isOpen: boolean;
  userId: number | undefined;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, userId, onClose }: DeleteAccountModalProps) {
  const { cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const { mostrarNotificacion } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await usersService.deleteAccount(userId);
      cerrarSesion();
      navigate('/iniciar-sesion');
    } catch (error) {
      console.error('Error deleting account:', error);
      mostrarNotificacion('Error al eliminar la cuenta.', 'error');
      setLoading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="perfil-modal-overlay" onClick={onClose}>
      <div className="perfil-modal" onClick={e => e.stopPropagation()}>
        <h3>¿Estás absolutamente seguro?</h3>
        <p>Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y removerá tus datos.</p>
        <div className="perfil-modal-footer">
          <button className="perfil-btn-cancelar" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="perfil-btn-confirmar-eliminar"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}
