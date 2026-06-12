export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sellerId: number;
  imageUrl?: string; // Adding this in case there's an image
}

export interface PaginationInfo {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: PaginationInfo;
  messages: Array<{ type: string; description: string }>;
}
