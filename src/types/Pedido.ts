// Tipos que coinciden exactamente con el backend (OrderResponseDto, OrderItemDto)

export interface OrderItemDto {
  orderId?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName?: string;
  productImageUrl?: string;
}

export interface OrderResponseDto {
  id: number;
  userId: number;
  totalAmount?: number;
  status: string;
  updatedAt?: string;
  orderItems: OrderItemDto[];
}
