// @ts-nocheck
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MdLock } from 'react-icons/md';

interface PropiedadesGuardiaRol {
  rolesPermitidos: string[];
  children: ReactNode;
}

export default function GuardiaRol({ rolesPermitidos, children }: PropiedadesGuardiaRol) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div>Cargando permisos...</div>;
  }

  const rolUsuario = usuario?.rol || '';

  if (!rolesPermitidos.includes(rolUsuario)) {
    return (
      <div className="empty-state" style={{ padding: '80px 24px' }}>
        <MdLock className=" empty-state-icon" aria-hidden="true" />
        <h3 className="empty-state-title">Acceso Denegado</h3>
        <p className="empty-state-description">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return <>{children}</>;
}
