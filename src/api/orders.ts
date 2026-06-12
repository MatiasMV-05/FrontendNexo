import axiosInstance from './axios';
import type { OrderResponseDto } from '../types/Pedido';

export const ordersService = {
  // GET /api/Orders/my-orders — Obtener historial de compras
  getMyOrders: async () => {
    const response = await axiosInstance.get<{ data: OrderResponseDto[] }>('/Orders/my-orders');
    return response.data;
  },

  // GET /api/Orders/my-sales — Obtener historial de ventas (para sellers)
  getMySales: async () => {
    const response = await axiosInstance.get<{ data: OrderResponseDto[] }>('/Orders/my-sales');
    return response.data;
  },
};
