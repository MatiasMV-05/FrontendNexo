import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersService } from '../../api/users';
import './styles/GestionUsuarios.css';

interface UserData {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  roles?: string[];
  billetera?: number;
}

interface EditForm {
  name: string;
  email: string;
  isActive: boolean;
}

export default function GestionUsuarios() {
  const { usuario } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    email: '',
    isActive: true,
  });
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await usersService.getAllUsers();
      setUsers((res as any).data || (res as any) as UserData[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario && usuario.rol === 'Administrator') {
      loadUsers();
    }
  }, [usuario]);

  const getRoleFromUser = (u: UserData): string => {
    if (u.roles?.includes('Administrator')) return 'Administrator';
    if (u.roles?.includes('Seller')) return 'Seller';
    return 'Customer';
  };

  // Abrir modal con datos del usuario
  const abrirModalEdicion = (u: UserData) => {
    setUsuarioEditando(u);
    setEditForm({
      name: u.name,
      email: u.email,
      isActive: u.isActive,
    });
    setErrorModal('');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
    setErrorModal('');
  };

  const handleGuardarEdicion = async () => {
    if (!usuarioEditando) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setErrorModal('El nombre y el email son obligatorios.');
      return;
    }

    try {
      setGuardando(true);
      await usersService.updateUserAdmin(usuarioEditando.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        isActive: editForm.isActive,
      });
      await loadUsers();
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrorModal('Error al guardar los cambios. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;
      await usersService.updateUserAdmin(userId, {
        name: userToUpdate.name,
        email: userToUpdate.email,
        isActive: !currentActive,
      });
      loadUsers();
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('Error al actualizar el estado del usuario.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario del sistema?')) {
      try {
        await usersService.deleteAccount(userId);
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error al eliminar el usuario.');
      }
    }
  };

  if (!usuario || usuario.rol !== 'Administrator') {
    return <div className="p-xl text-center">Acceso denegado. Solo para Administradores.</div>;
  }

  // Filtrado por búsqueda
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="contenedor-gestion-usuarios">
      <div className="principal-gestion-usuarios">
        {/* Encabezado */}
        <header className="encabezado-gestion">
          <div className="flex items-center gap-2">
            <h2 className="titulo-encabezado-gestion">Gestión de Usuarios</h2>
          </div>

          <div className="contenedor-busqueda-gestion">
            <span className="material-symbols-outlined icono-busqueda-gestion">search</span>
            <input
              type="text"
              className="entrada-busqueda-gestion"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

        </header>

        {/* Contenido Principal */}
        <main className="area-contenido-gestion">
          <div className="tarjeta-tabla-usuarios">
            <div className="indicador-tabla-usuarios"></div>

            {loading ? (
              <div className="estado-carga">Cargando usuarios...</div>
            ) : (
              <div className="contenedor-tabla">
                <table className="tabla-usuarios">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Estado</th>
                      <th className="th-acciones">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((u) => {
                      const initials = u.name ? u.name.substring(0, 2).toUpperCase() : 'U';
                      const isAdmin = getRoleFromUser(u) === 'Administrator';
                      const esMismo = u.id === usuario.id;

                      return (
                        <tr key={u.id} className="fila-usuario">
                          <td>
                            <div className="celda-info-usuario">
                              <div className="avatar-usuario cliente">{initials}</div>
                              <div>
                                <div className="nombre-usuario">{u.name}</div>
                                <div className="correo-usuario">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className={`etiqueta-estado ${u.isActive ? 'activo' : 'inactivo'}`}>
                              <span className="punto-estado"></span>
                              {u.isActive ? 'Activo' : 'Inactivo'}
                            </div>
                          </td>
                          <td>
                            <div className="celda-acciones">
                              <label className="interruptor">
                                <input
                                  type="checkbox"
                                  className="entrada-interruptor"
                                  checked={u.isActive}
                                  onChange={() => handleToggleActive(u.id, u.isActive)}
                                  disabled={isAdmin && esMismo}
                                />
                                <div className="pista-interruptor">
                                  <div className="pulgar-interruptor"></div>
                                </div>
                              </label>
                              <button
                                className="boton-icono"
                                title="Editar"
                                onClick={() => abrirModalEdicion(u)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                              </button>
                              <button
                                className="boton-icono eliminar"
                                title="Eliminar"
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={isAdmin && esMismo}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {!loading && filteredUsers.length > 0 && (
              <div className="contenedor-paginacion">
                <div className="texto-paginacion">
                  Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length} usuarios
                </div>
                <div className="controles-paginacion">
                  <button
                    className="boton-pagina"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={`boton-pagina ${currentPage === i + 1 ? 'activo' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="boton-pagina"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ─── MODAL DE EDICIÓN ─── */}
      {modalAbierto && usuarioEditando && (
        <div className="overlay-modal" onClick={cerrarModal}>
          <div className="contenedor-modal" onClick={(e) => e.stopPropagation()}>

            {/* Cabecera */}
            <div className="cabecera-modal">
              <div className="titulo-modal-grupo">
                <div className="icono-titulo-modal">
                  <span className="material-symbols-outlined">manage_accounts</span>
                </div>
                <div>
                  <h3 className="titulo-modal">Editar Usuario</h3>
                  <p className="subtitulo-modal">Modifica los datos del usuario</p>
                </div>
              </div>
              <button className="boton-cerrar-modal" onClick={cerrarModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Cuerpo */}
            <div className="cuerpo-modal">

              {errorModal && (
                <div className="alerta-error-modal">
                  <span className="material-symbols-outlined">error</span>
                  {errorModal}
                </div>
              )}

              <div className="campo-modal">
                <label className="etiqueta-campo-modal">Nombre completo</label>
                <div className="entrada-icono-modal">
                  <span className="material-symbols-outlined icono-entrada-modal">person</span>
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
                  <span className="material-symbols-outlined icono-entrada-modal">mail</span>
                  <input
                    type="email"
                    className="entrada-modal"
                    placeholder="correo@ejemplo.com"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="campo-modal">
                <label className="etiqueta-campo-modal">Estado de la cuenta</label>
                <div className="opciones-estado-modal">
                  <button
                    className={`opcion-estado ${editForm.isActive ? 'activo' : ''}`}
                    onClick={() => setEditForm({ ...editForm, isActive: true })}
                    disabled={usuarioEditando.id === usuario.id}
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Activo
                  </button>
                  <button
                    className={`opcion-estado ${!editForm.isActive ? 'inactivo-sel' : ''}`}
                    onClick={() => setEditForm({ ...editForm, isActive: false })}
                    disabled={usuarioEditando.id === usuario.id}
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    Inactivo
                  </button>
                </div>
              </div>
            </div>

            {/* Pie */}
            <div className="pie-modal">
              <button className="boton-cancelar-modal" onClick={cerrarModal} disabled={guardando}>
                Cancelar
              </button>
              <button
                className="boton-guardar-modal"
                onClick={handleGuardarEdicion}
                disabled={guardando}
              >
                {guardando ? (
                  <>
                    <span className="spinner-modal"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Guardar cambios
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}