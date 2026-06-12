import axiosInstance from './axios';

export const usersService = {
  // Update User Profile
  updateProfile: async (id: number, data: { name: string; email: string }) => {
    const response = await axiosInstance.put(`/Users/${id}`, data);
    return response.data;
  },

  // Get Wallet Balance
  getWalletBalance: async (id: number) => {
    const response = await axiosInstance.get(`/Users/${id}/billetera`);
    return response.data;
  },

  // Recharge Wallet
  rechargeWallet: async (id: number, amount: number) => {
    const response = await axiosInstance.post(`/Users/${id}/billetera/llenar/${amount}`);
    return response.data;
  },

  // Delete Account
  deleteAccount: async (id: number) => {
    await axiosInstance.delete(`/Users/${id}`);
  },

  // Admin: Get all users
  getAllUsers: async () => {
    const response = await axiosInstance.get<{ data: any[] }>('/Users');
    return response.data;
  },

  // Admin: Update user completely
  updateUserAdmin: async (id: number, data: { name: string; email: string; isActive: boolean; role?: number }) => {
  const response = await axiosInstance.put(`/Users/${id}/admin`, {
    Name: data.name,
    Email: data.email,
    IsActive: data.isActive,
    Role: data.role 
  });
  return response.data;
}
};
