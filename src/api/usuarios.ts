import axios from './axios';

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

export const obtenerUsuarios = async (page = 1, pageSize = 10) => {
  const res = await axios.get('/Users', { params: { PageNumber: page, PageSize: pageSize } });
  return res.data;
};

export const eliminarUsuario = async (id: number) => {
  await axios.delete(`/Users/${id}`);
};

export const activarUsuario = async (id: number) => {
  const res = await axios.put(`/Users/activate/${id}`);
  return res.data;
};

export const cambiarRol = async (id: number, rol: 'Customer' | 'Seller') => {
  const res = await axios.patch(`/Users/${id}/role`, { role: rol });
  return res.data;
};
