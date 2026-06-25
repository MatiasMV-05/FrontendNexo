import axiosInstance from './auth';

// ─── Tipos ──────────────────────────────────────────────────────────────────
export type Usuario = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  billetera?: number;
};

export type ObtenerUsuariosResponse = {
  data: Usuario[];
  pagination?: any;
  messages?: string[];
};

// ─── Servicio unificado de usuarios ─────────────────────────────────────────
export const usersService = {

  // ── Perfil propio ──────────────────────────────────────────────────────────

  /** Actualiza nombre y email del usuario autenticado */
  updateProfile: async (id: number, data: { name: string; email: string }) => {
    const response = await axiosInstance.put(`/Users/${id}`, data);
    return response.data;
  },

  /** Obtiene el saldo de la billetera */
  getWalletBalance: async (id: number) => {
    const response = await axiosInstance.get(`/Users/${id}/billetera`);
    return response.data;
  },

  /** Recarga saldo a la billetera */
  rechargeWallet: async (id: number, amount: number) => {
    const response = await axiosInstance.post(`/Users/${id}/billetera/llenar/${amount}`);
    return response.data;
  },

  /** Elimina la propia cuenta */
  deleteAccount: async (id: number) => {
    await axiosInstance.delete(`/Users/${id}`);
  },

  // ── Administración (solo rol Administrator) ───────────────────────────────

  /** Obtiene todos los usuarios paginados */
  getAllUsers: async (page = 1, pageSize = 10) => {
    const response = await axiosInstance.get<{ data: Usuario[] }>('/Users', {
      params: { PageNumber: page, PageSize: pageSize },
    });
    return response.data;
  },

  /** Actualiza datos de un usuario desde el panel de administración */
  updateUserAdmin: async (
    id: number,
    data: { name: string; email: string; isActive: boolean; role?: number }
  ) => {
    const response = await axiosInstance.put(`/Users/${id}/admin`, {
      Name: data.name,
      Email: data.email,
      IsActive: data.isActive,
      Role: data.role,
    });
    return response.data;
  },

  /** Activa o desactiva una cuenta de usuario */
  activarUsuario: async (id: number) => {
    const response = await axiosInstance.put(`/Users/activate/${id}`);
    return response.data;
  },

  /** Cambia el rol de un usuario (Customer / Seller) */
  cambiarRol: async (id: number, rol: 'Customer' | 'Seller') => {
    const response = await axiosInstance.patch(`/Users/${id}/role`, { role: rol });
    return response.data;
  },

  /** Crea un nuevo usuario desde el panel de administración */
  createUser: async (data: any) => {
    const response = await axiosInstance.post(`/Security/register`, data);
    return response.data;
  },
};
