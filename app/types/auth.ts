export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'seller' | 'customer';
}

export interface AuthResponse {
  user: User;
  token: string;
}
