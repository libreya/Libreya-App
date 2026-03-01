const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE}/api${endpoint}`);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  async post(endpoint: string, data?: any) {
    const response = await fetch(`${API_BASE}/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  async patch(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE}/api${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE}/api${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
};
