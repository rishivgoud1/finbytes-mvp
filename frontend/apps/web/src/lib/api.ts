const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code: number;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('authToken') 
    : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'An error occurred',
        code: response.status,
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      code: 500,
    };
  }
}

export const authAPI = {
  register: (email: string, password: string, displayName?: string) =>
    apiCall<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    }),

  login: (email: string, password: string) =>
    apiCall<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  profile: () => apiCall('/auth/profile'),
};

export const articlesAPI = {
  feed: (limit = 20, offset = 0) =>
    apiCall('/articles?limit=' + limit + '&offset=' + offset),

  detail: (id: string) =>
    apiCall(`/articles/${id}`),
};

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
}