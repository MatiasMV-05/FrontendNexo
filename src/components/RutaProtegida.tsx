import { Navigate } from 'react-router-dom';
import { useAuth, type RolUsuario } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  rolesPermitidos?: RolUsuario[]; // Usa el tipo exacto de tus roles
}

export default function RutaProtegida({ children, rolesPermitidos }: Props) {
  const { usuario, cargando } = useAuth();

  // Mientras verifica la sesión (por ejemplo, al recargar la página)
  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner">Cargando...</div> {/* Puedes poner un spinner bonito */}
      </div>
    );
  }

  // No autenticado
  if (!usuario) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  // Si se especificaron roles, verificar que el usuario tenga uno de ellos
  if (rolesPermitidos && rolesPermitidos.length > 0) {
    const tienePermiso = rolesPermitidos.includes(usuario.rol);
    if (!tienePermiso) {
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  // Autenticado y con rol permitido (o sin restricción)
  return <>{children}</>;
}