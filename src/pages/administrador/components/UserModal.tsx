// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MdPersonAdd, MdManageAccounts, MdClose, MdError, MdPerson, MdMail, MdLock, MdCheckCircle, MdCancel, MdSave } from 'react-icons/md';
import './styles/UserModal.css';

interface UserData {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  role?: string;
  billetera?: number;
}

interface UserModalProps {
  isOpen: boolean;
  modoModal: 'crear' | 'editar';
  usuarioEditando: UserData | null;
  usuarioLogueadoId: number | undefined;
  onClose: () => void;
  onSave: (formData: any) => Promise<void>;
}

export default function UserModal({
  isOpen,
  modoModal,
  usuarioEditando,
  usuarioLogueadoId,
  onClose,
  onSave
}: UserModalProps) {
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    isActive: true,
    role: 2,
  });
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (modoModal === 'editar' && usuarioEditando) {
        let currentRole = 2; // Customer default
        if (usuarioEditando.role === 'Administrator') currentRole = 0;
        else if (usuarioEditando.role === 'Seller') currentRole = 1;

        setEditForm({
          name: usuarioEditando.name,
          email: usuarioEditando.email,
          isActive: usuarioEditando.isActive,
          role: currentRole,
          password: ''
        });
      } else {
        setEditForm({
          name: '',
          email: '',
          password: '',
          isActive: true,
          role: 2,
        });
      }
      setErrorModal('');
    }
  }, [isOpen, modoModal, usuarioEditando]);

  const handleGuardar = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setErrorModal('El nombre y el email son obligatorios.');
      return;
    }
    if (modoModal === 'crear' && (!editForm.password || editForm.password.length < 6)) {
      setErrorModal('La contraseña es obligatoria y debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setGuardando(true);
      await onSave(editForm);
    } catch (error: any) {
      console.error('Error al guardar:', error);
      setErrorModal(
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response?.data : 'Error al guardar los cambios. Intenta nuevamente.')
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="overlay-modal" onClick={onClose}>
      <div className="contenedor-modal" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="cabecera-modal">
          <div className="titulo-modal-grupo">
            <div className="icono-titulo-modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {modoModal === 'crear' ? <MdPersonAdd size={24} /> : <MdManageAccounts size={24} />}
            </div>
            <div>
              <h3 className="titulo-modal">{modoModal === 'crear' ? 'Crear Usuario' : 'Editar Usuario'}</h3>
              <p className="subtitulo-modal">{modoModal === 'crear' ? 'Ingresa los datos del nuevo usuario' : 'Modifica los datos del usuario'}</p>
            </div>
          </div>
          <button className="boton-cerrar-modal" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="cuerpo-modal">
          {errorModal && (
            <div className="alerta-error-modal">
              <MdError />
              {errorModal}
            </div>
          )}

          <div className="campo-modal">
            <label className="etiqueta-campo-modal">Nombre completo</label>
            <div className="entrada-icono-modal">
              <MdPerson className=" icono-entrada-modal" />
              <input
                type="text"
                className="entrada-modal"
                placeholder="Nombre del usuario"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
          </div>

          <div className="campo-modal">
            <label className="etiqueta-campo-modal">Correo electrónico</label>
            <div className="entrada-icono-modal">
              <MdMail className=" icono-entrada-modal" />
              <input
                type="email"
                className="entrada-modal"
                placeholder="correo@ejemplo.com"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
          </div>

          {modoModal === 'crear' && (
            <div className="campo-modal">
              <label className="etiqueta-campo-modal">Contraseña</label>
              <div className="entrada-icono-modal">
                <MdLock className=" icono-entrada-modal" />
                <input
                  type="password"
                  className="entrada-modal"
                  placeholder="Mínimo 6 caracteres"
                  value={editForm.password || ''}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="campo-modal">
            <label className="etiqueta-campo-modal">Rol del usuario</label>
            <select
              className="entrada-modal"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: Number(e.target.value) })}
              style={{ paddingLeft: '12px' }}
              disabled={usuarioEditando?.id === usuarioLogueadoId}
            >
              <option value={2}>Cliente (Customer)</option>
              <option value={1}>Vendedor (Seller)</option>
              <option value={0}>Administrador</option>
            </select>
          </div>

          {modoModal === 'editar' && (
            <div className="campo-modal">
              <label className="etiqueta-campo-modal">Estado de la cuenta</label>
              <div className="opciones-estado-modal">
                <button
                  className={`opcion-estado ${editForm.isActive ? 'activo' : ''}`}
                  onClick={() => setEditForm({ ...editForm, isActive: true })}
                  disabled={usuarioEditando?.id === usuarioLogueadoId}
                >
                  <MdCheckCircle />
                  Activo
                </button>
                <button
                  className={`opcion-estado ${!editForm.isActive ? 'inactivo-sel' : ''}`}
                  onClick={() => setEditForm({ ...editForm, isActive: false })}
                  disabled={usuarioEditando?.id === usuarioLogueadoId}
                >
                  <MdCancel />
                  Inactivo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="pie-modal">
          <button className="boton-cancelar-modal" onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button
            className="boton-guardar-modal"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? (
              <>
                <span className="spinner-modal"></span>
                Guardando...
              </>
            ) : (
              <>
                <MdSave />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
