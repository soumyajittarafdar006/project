const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const apiService = {
  getApiUrl: () => API_URL,

  async getLatest() {
    const res = await fetch(`${API_URL}/api/sensor/latest`);
    return handleResponse(res);
  },

  async getHistory(limit = 50) {
    const res = await fetch(`${API_URL}/api/sensor/history?limit=${limit}`);
    return handleResponse(res);
  },

  async getStats() {
    const res = await fetch(`${API_URL}/api/sensor/stats`);
    return handleResponse(res);
  },

  async getStatus() {
    const res = await fetch(`${API_URL}/api/sensor/status`);
    return handleResponse(res);
  },

  async getSettings() {
    const res = await fetch(`${API_URL}/api/settings`);
    return handleResponse(res);
  },

  async updateSettings(settings) {
    const res = await fetch(`${API_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return handleResponse(res);
  },

  async getAlerts(limit = 20) {
    const res = await fetch(`${API_URL}/api/sensor/alerts?limit=${limit}`);
    return handleResponse(res);
  },

  async postTestReading(deviceId, temperature) {
    const res = await fetch(`${API_URL}/api/sensor/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, temperature: parseFloat(temperature) })
    });
    return handleResponse(res);
  }
};
