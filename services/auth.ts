import apiClient from '@/lib/axios';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

export const getProtectedData = async () => {
  try {
    const response = await apiClient.get('/protected-route');
    return response.data;
  } catch (error) {
    throw error;
  }
};
