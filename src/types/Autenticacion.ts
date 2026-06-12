export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'Customer' | 'Seller'; // Usando el backend (RoleType.Customer, RoleType.Seller)
}

// Representa la respuesta de /api/Token
export interface LoginResponseDto {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: string | number; // El RoleType enum del backend
  expiresAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface DecodedToken {
  sub: string;
  name: string;
  email: string;
  role: string;
  exp: number;
}
