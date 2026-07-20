export interface User {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  hasPaid: boolean;
  isActive: boolean;
  role?: string;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  hasPaid: boolean;
  isActive: boolean;
}