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

// ============================================
// WEEK 5 — AUTHORING SUITE
// ============================================

export type ManuscriptStatus =
  | 'DRAFT'
  | 'AWAITING_REVIEW'
  | 'EDITOR_ASSIGNED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED';

export interface AssetRecord {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string | null;
  createdAt: string;
}

export interface Manuscript {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  bodyMarkdown: string;
  status: ManuscriptStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  assets?: AssetRecord[];
}

export interface ManuscriptInput {
  title: string;
  subtitle?: string;
  category: string;
  bodyMarkdown?: string;
}

export const manuscriptsAPI = {
  list: () => apiCall<Manuscript[]>('/manuscripts'),

  get: (id: string) => apiCall<Manuscript>(`/manuscripts/${id}`),

  create: (payload: ManuscriptInput) =>
    apiCall<Manuscript>('/manuscripts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<ManuscriptInput>) =>
    apiCall<Manuscript>(`/manuscripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  submit: (id: string) =>
    apiCall<Manuscript>(`/manuscripts/${id}/submit`, { method: 'POST' }),

  remove: (id: string) =>
    apiCall<{ id: string }>(`/manuscripts/${id}`, { method: 'DELETE' }),
};

export const uploadsAPI = {
  sign: (payload: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    manuscriptId?: string;
  }) =>
    apiCall<{
      assetId: string;
      key: string;
      uploadUrl: string;
      publicUrl: string | null;
      expiresIn: number;
    }>('/uploads/sign', { method: 'POST', body: JSON.stringify(payload) }),

  forManuscript: (id: string) =>
    apiCall<AssetRecord[]>(`/uploads/manuscript/${id}`),

  remove: (assetId: string) =>
    apiCall<{ id: string }>(`/uploads/${assetId}`, { method: 'DELETE' }),
};

export const ALLOWED_UPLOAD_TYPES = [
  'application/pdf',
  'image/webp',
  'text/csv',
];

/**
 * Uploads a file straight to object storage using a presigned URL.
 * The file never passes through the API server.
 */
export async function uploadFile(
  file: File,
  manuscriptId?: string
): Promise<{ ok: boolean; publicUrl?: string | null; error?: string }> {
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    return { ok: false, error: 'Only PDF, WebP and CSV files are allowed' };
  }

  const signed = await uploadsAPI.sign({
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    manuscriptId,
  });

  if (!signed.success || !signed.data) {
    return { ok: false, error: signed.error || 'Could not prepare upload' };
  }

  try {
    const put = await fetch(signed.data.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!put.ok) return { ok: false, error: `Upload failed (${put.status})` };
    return { ok: true, publicUrl: signed.data.publicUrl };
  } catch {
    return { ok: false, error: 'Network error during upload' };
  }
}

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