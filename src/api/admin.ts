import axiosInstance from './axios';

export interface BoardStatsResponse {
  TotalUsuarios: number;
  UsuariosConAltoSaldo: number;
  TotalProductos: number;
  ProductosSinStock: number;
  TotalOrdenes: number;
  OrdenesPagadas: number;
  CarritosActivos: number;
  IngresosTotales: number;
  TicketPromedio: number;
  SaldoTotalUsuarios: number;
}

export interface ReporteMensualVentasResponse {
  Año: number;
  Mes: number;
  NombreMes: string;
  OrdenesCompletadas: number;
  ProductosVendidos: number;
  IngresosTotales: number;
  TicketPromedio: number;
}

export interface TopProductosVendidosResponse {
  Id: number;
  Name: string;
  Category: string;
  TotalVendido: number;
  IngresosTotales: number;
}

export interface TopUsersBySpendingResponse {
  Id: number;
  Name: string;
  Email: string;
  TotalGastado: number;
  TotalOrdenes: number;
}

export const adminService = {
  getBoardStats: async () => {
    const response = await axiosInstance.get<{ Data: BoardStatsResponse[] }>('/Orders/dapper/board-stats');
    return response.data.Data;
  },

  getMonthlySales: async () => {
    const response = await axiosInstance.get<{ Data: ReporteMensualVentasResponse[] }>('/Orders/dapper/monthly-sales');
    return response.data.Data;
  },

  getTopProducts: async () => {
    const response = await axiosInstance.get<{ Data: TopProductosVendidosResponse[] }>('/Orders/dapper/top-products');
    return response.data.Data;
  },

  getTopUsers: async () => {
    const response = await axiosInstance.get<{ Data: TopUsersBySpendingResponse[] }>('/Orders/dapper/top-users');
    return response.data.Data;
  }
};
