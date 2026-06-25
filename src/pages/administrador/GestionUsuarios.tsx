// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersService } from '../../services/users';
import { useNotification } from '../../contexts/NotificationContext';
import './styles/GestionUsuarios.css';
import { Helmet } from 'react-helmet-async';
import { MdSearch, MdPersonAdd, MdEdit, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import UserModal from './components/UserModal';

interface UserData {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  role?: string;
  billetera?: number;
}

export default function GestionUsuarios() {
  const { usuario } = useAuth();
  const { mostrarNotificacion } = useNotification();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState<'crear' | 'editar'>('editar');
  const [usuarioEditando, setUsuarioEditando] = useState<UserData | null>(null);

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
    if (u.role === 'Administrator') return 'Administrator';
    if (u.role === 'Seller') return 'Seller';
    return 'Customer';
  };

  // Abrir modal con datos del usuario
  const abrirModalEdicion = (u: UserData) => {
    setModoModal('editar');
    setUsuarioEditando(u);
    setModalAbierto(true);
  };

  const abrirModalCreacion = () => {
    setModoModal('crear');
    setUsuarioEditando(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
  };

  const handleGuardarEdicion = async (formData: any) => {
    try {
      if (modoModal === 'crear') {
        await usersService.createUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        });
        mostrarNotificacion('Usuario creado exitosamente', 'success');
      } else {
        if (!usuarioEditando) return;
        await usersService.updateUserAdmin(usuarioEditando.id, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          isActive: formData.isActive,
          role: formData.role,
        });
        mostrarNotificacion('Usuario actualizado exitosamente', 'success');
      }
      await loadUsers();
      cerrarModal();
    } catch (error: any) {
      throw error;
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
      mostrarNotificacion('Error al actualizar el estado del usuario.', 'error');
    }
  };

  if (!usuario || usuario.rol !== 'Administrator') {
    return <div className="gestion-usuarios-acceso-denegado">Acceso denegado. Solo para Administradores.</div>;
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
    <div>
      <Helmet>
        <title>Gestión de Usuarios - Administrador</title>
        <meta
          name="description"
          content="Panel de administración para gestionar usuarios, incluyendo creación, edición y eliminación de cuentas."
        />
        <meta 
          name="keywords" 
          content="gestión de usuarios, administración, panel de control, crear usuario, editar usuario, eliminar usuario" 
        />
        <meta
          name="author"
          content="Panel de Administración"
        />  

        {/* Open Graph */}
        <meta 
          property="og:title"
          content="Gestión de Usuarios - Administrador"
        />
        <meta
          property="og:description"
          content="Panel de administración para gestionar usuarios, incluyendo creación, edición y eliminación de cuentas."
        />
        <meta
          property="og:type"
          content="website"
        />
      </Helmet>
    <div className="contenedor-gestion-usuarios">
      <div className="principal-gestion-usuarios">
        {/* Encabezado */}
        <header className="encabezado-gestion">
          <div className="gestion-usuarios-header-grupo">
            <h2 className="titulo-encabezado-gestion">Gestión de Usuarios</h2>
          </div>

          <div className="contenedor-busqueda-gestion">
            <MdSearch className=" icono-busqueda-gestion" />
            <input
              type="text"
              className="entrada-busqueda-gestion"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <button className="boton-nuevo-usuario" onClick={abrirModalCreacion}>
              <MdPersonAdd />
              Crear Usuario
            </button>

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
                      const roleName = getRoleFromUser(u);
                      let avatarClass = 'cliente';
                      if (roleName === 'Administrator') avatarClass = 'admin';
                      else if (roleName === 'Seller') avatarClass = 'vendedor';
                      
                      const esMismo = u.id === usuario.id;

                      return (
                        <tr key={u.id} className="fila-usuario">
                          <td>
                            <div className="celda-info-usuario">
                              <div className={`avatar-usuario ${avatarClass}`}>{initials}</div>
                              <div>
                                <div className="nombre-usuario">
                                  {u.name} 
                                  <span style={{ fontSize: '12px', color: '#777587', fontWeight: 'normal', marginLeft: '6px' }}>({roleName})</span>
                                </div>
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
                              <label className="interruptor" title="Activar/Desactivar">
                                <input
                                  type="checkbox"
                                  className="entrada-interruptor"
                                  checked={u.isActive}
                                  onChange={() => handleToggleActive(u.id, u.isActive)}
                                  disabled={esMismo}
                                />
                                <span className="pista-interruptor">
                                  <span className="pulgar-interruptor"></span>
                                </span>
                              </label>

                              <button
                                className="boton-icono"
                                title="Editar"
                                onClick={() => abrirModalEdicion(u)}
                              >
                                <MdEdit style={{ fontSize: '20px' }} />
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
                    <MdChevronLeft style={{ fontSize: '18px' }} />
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
                    <MdChevronRight style={{ fontSize: '18px' }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <UserModal
        isOpen={modalAbierto}
        modoModal={modoModal}
        usuarioEditando={usuarioEditando}
        usuarioLogueadoId={usuario?.id}
        onClose={cerrarModal}
        onSave={handleGuardarEdicion}
      />
      </div>
    </div>
  );
}