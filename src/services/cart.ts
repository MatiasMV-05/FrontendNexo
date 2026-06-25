import axiosInstance from './auth';
import type { OrderResponseDto } from '../types/Pedido';

const getOrCreateCart = async (productId: number, quantity: number): Promise<void> => {
  try {
    // Intentar añadir directamente
    await axiosInstance.post('/Orders/my-cart/items', { productId, quantity });
  } catch (err: any) {
    if (err.response?.status === 400 || err.response?.status === 404) {
      // No hay carrito — crear uno con el item incluido
      await axiosInstance.post('/Orders', {
        orderItems: [{ productId, quantity }],
      });
      // No llamar my-cart/items de nuevo, ya quedó incluido
    } else {
      throw err;
    }
  }
};

export const cartService = {
  // GET /api/Orders/my-cart — Obtener carrito activo
  getMyCart: async () => {
    const response = await axiosInstance.get<{ data: OrderResponseDto }>('/Orders/my-cart');
    return response.data;
  },

  // POST /api/Orders — Crear un nuevo carrito (orden con su primer item)
  createOrder: async (productId: number, quantity: number) => {
    const response = await axiosInstance.post<{ data: OrderResponseDto }>('/Orders', {
      orderItems: [{ productId, quantity }],
    });
    return response.data;
  },

  // POST /api/Orders/my-cart/items — Añadir item al carrito
  addItemToCart: async (productId: number, quantity: number) => {
    await getOrCreateCart(productId, quantity);
  },

  // DELETE /api/Orders/my-cart/items/{productId} — Eliminar item del carrito
  removeItemFromCart: async (productId: number) => {
    const response = await axiosInstance.delete(`/Orders/my-cart/items/${productId}`);
    return response.data;
  },

  // PUT (simulado) — Actualizar cantidad eliminando y re-agregando
  updateItemQuantity: async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await cartService.removeItemFromCart(productId);
      return;
    }
    // Para simplificar, si queremos un número exacto, primero eliminamos y luego añadimos.
    // Esto funciona porque si lo eliminamos, el backend lo creará con la cantidad enviada.
    await cartService.removeItemFromCart(productId);
    await cartService.addItemToCart(productId, newQuantity);
  },

  // POST /api/Orders/my-cart/checkout — Procesar pago
  checkout: async () => {
    const response = await axiosInstance.post<{ data: { id: number; amount: number } }>('/Orders/my-cart/checkout');
    return response.data;
  },
};
