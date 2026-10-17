const API_BASE = '/api/v1';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id?: string;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('talentpilot_auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('talentpilot_auth_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('talentpilot_auth_token');
  localStorage.removeItem('talentpilot_user');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export async function uploadResumeFile(file: File): Promise<any> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/candidates/upload-resume`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = `Failed to parse resume (${response.status})`;
    try {
      const err = await response.json();
      if (err?.detail) errorDetail = err.detail;
    } catch {}
    throw new Error(errorDetail);
  }

  return response.json();
}
