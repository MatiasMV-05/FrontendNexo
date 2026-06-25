import axiosInstance from './auth';

export interface BoardStatsResponse {
  totalUsuarios: number;
  usuariosConAltoSaldo: number;
  totalProductos: number;
  productosSinStock: number;
  totalOrdenes: number;
  ordenesPagadas: number;
  carritosActivos: number;
  ingresosTotales: number;
  ticketPromedio: number;
  saldoTotalUsuarios: number;
}

export interface ReporteMensualVentasResponse {
  anio: number;
  mes: number;
  nombreMes: string;
  ordenesCompletadas: number;
  productosVendidos: number;
  ingresosTotales: number;
  ticketPromedio: number;
}

export interface TopProductosVendidosResponse {
  id: number;
  name: string;
  category: string;
  totalVendido: number;
  ingresosTotales: number;
}

export interface TopUsersBySpendingResponse {
  id: number;
  name: string;
  email: string;
  totalGastado: number;
  totalOrdenes: number;
}

export interface LowStockProductResponse {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export const adminService = {
  getBoardStats: async () => {
    const response = await axiosInstance.get<{ data: BoardStatsResponse[] }>('/Orders/dapper/board-stats');
    return response.data.data;
  },

  getMonthlySales: async () => {
    const response = await axiosInstance.get<{ data: ReporteMensualVentasResponse[] }>('/Orders/dapper/monthly-sales');
    return response.data.data;
  },

  getTopProducts: async () => {
    const response = await axiosInstance.get<{ data: TopProductosVendidosResponse[] }>('/Orders/dapper/top-products');
    return response.data.data;
  },

  getTopUsers: async () => {
    const response = await axiosInstance.get<{ data: TopUsersBySpendingResponse[] }>('/Orders/dapper/top-users');
    return response.data.data;
  },

  getLowStockProducts: async () => {
    const response = await axiosInstance.get<{ data: LowStockProductResponse[] }>('/Orders/dapper/low-stock');
    return response.data.data;
  }
};
