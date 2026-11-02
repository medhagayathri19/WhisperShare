import axios from 'axios';

// Connect to backend (configurable via VITE_API_URL, defaults to localhost:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Secret Note APIs
  async createSecret(message, expiresIn = '1h') {
    const response = await apiClient.post('/secrets/create', { message, expiresIn });
    return response.data;
  },

  async getSecretInfo(token) {
    const response = await apiClient.post('/secrets/info', { token });
    return response.data;
  },

  async claimSecret(token) {
    const response = await apiClient.post('/secrets/claim', { token });
    return response.data;
  },

  // File Sharing APIs
  async uploadFile(file, expiresIn = '1h', onUploadProgress = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('expiresIn', expiresIn);

    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return response.data;
  },

  async getFileInfo(token) {
    const response = await apiClient.post('/files/info', { token });
    return response.data;
  },

  async claimFile(token) {
    const response = await apiClient.post('/files/claim', { token });
    return response.data;
  },

  getDownloadUrl(claimTicket) {
    return `${API_BASE_URL}/files/download/${claimTicket}`;
  },

  // Health check
  async checkHealth() {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiService;
