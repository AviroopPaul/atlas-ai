// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  apiPrefix: "/api/v1",
};

export const API_ENDPOINTS = {
  files: {
    upload: `${API_CONFIG.apiPrefix}/files/upload`,
    list: `${API_CONFIG.apiPrefix}/files/`,
    get: (id) => `${API_CONFIG.apiPrefix}/files/${id}`,
    delete: (id) => `${API_CONFIG.apiPrefix}/files/${id}`,
  },
  query: `${API_CONFIG.apiPrefix}/query`,
};
