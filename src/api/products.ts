import axiosInstance from './axios';
import type { ProductDto, PaginatedResponse } from '../types/Producto';

export interface ProductQueryFilter {
  pageNumber?: number;
  pageSize?: number;
  category?: string;
  name?: string;
}

export const productService = {
  // Get paginated products with optional filters
  getProducts: async (filters?: ProductQueryFilter) => {
    const response = await axiosInstance.get<PaginatedResponse<ProductDto[]>>('/Products', {
      params: filters,
    });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: number) => {
    const response = await axiosInstance.get<{ data: ProductDto }>(`/Products/${id}`);
    return response.data;
  },

  // Get products by exact category
  getProductsByCategory: async (category: string) => {
    const response = await axiosInstance.get<{ data: ProductDto[] }>(`/Products/category/${category}`);
    return response.data;
  },

  // Get products by authenticated seller
  getMyProducts: async () => {
    const response = await axiosInstance.get<{ data: ProductDto[] }>('/Products/my-products');
    return response.data;
  },

  // Create product
  createProduct: async (product: Omit<ProductDto, 'id' | 'sellerId' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const response = await axiosInstance.post<{ data: ProductDto }>('/Products', product);
    return response.data;
  },

  // Update product
  updateProduct: async (id: number, product: ProductDto) => {
    const response = await axiosInstance.put<{ data: ProductDto }>(`/Products/${id}`, product);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: number) => {
    await axiosInstance.delete(`/Products/${id}`);
  }
};
