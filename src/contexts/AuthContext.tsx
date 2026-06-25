import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axiosInstance from '../services/auth';
import type { LoginRequest, LoginResponseDto } from '../types/Autenticacion';

// Roles que maneja el sistema — deben coincidir con RoleType del backend
export type RolUsuario = 'Administrator' | 'Seller' | 'Customer';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

interface TipoContextoAuth {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  cargando: boolean;
  iniciarSesion: (credenciales: LoginRequest) => Promise<Usuario>;
  cerrarSesion: () => void;
}

// Mapea el rol que llega del backend (número o string) al string canónico
function normalizarRol(rol: string | number | null | undefined): RolUsuario {
  const mapa: Record<string, RolUsuario> = {
    '0':             'Administrator',
    '1':             'Seller',
    '2':             'Customer',
    'administrator': 'Administrator',
    'seller':        'Seller',
    'customer':      'Customer',
  };
  const clave = String(rol ?? '').toLowerCase();
  return mapa[clave] ?? 'Customer';
}

const ContextoAuth = createContext<TipoContextoAuth | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando]     = useState<boolean>(true);

  // Restaurar sesión desde localStorage al montar
  useEffect(() => {
    const token       = localStorage.getItem('token');
    const usuarioJson = localStorage.getItem('user');

    if (token && usuarioJson) {
      try {
        const usuarioGuardado = JSON.parse(usuarioJson) as Usuario;
        setUsuario(usuarioGuardado);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setCargando(false);
  }, []);

  const iniciarSesion = async (credenciales: LoginRequest) => {
    // POST /api/Token — el body debe coincidir con UserLogin del backend
    // Si tu UserLogin tiene { user, password } cambia el campo aquí:
    const response = await axiosInstance.post<LoginResponseDto>('/Token', {
      email:    credenciales.email,  
      password: credenciales.password,
    });

    const data = response.data;

    const usuarioAutenticado: Usuario = {
      id:     data.userId,
      nombre: data.name,
      email:  data.email,
      rol:    normalizarRol(data.role),
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(usuarioAutenticado));
    setUsuario(usuarioAutenticado);

    return usuarioAutenticado;
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUsuario(null);
  };

  const valor: TipoContextoAuth = {
    usuario,
    estaAutenticado: !!usuario,
    cargando,
    iniciarSesion,
    cerrarSesion,
  };

  return (
    <ContextoAuth.Provider value={valor}>
      {children}
    </ContextoAuth.Provider>
  );
}

export function useAuth(): TipoContextoAuth {
  const contexto = useContext(ContextoAuth);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return contexto;
}