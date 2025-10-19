import axios from "axios";
import { API_CONFIG } from "../config";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint
        const response = await axios.post(
          `${API_CONFIG.baseURL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// File upload API
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/api/v1/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Get all files
export const getFiles = async () => {
  const response = await apiClient.get("/api/v1/files/");
  return response.data;
};

// Get single file
export const getFile = async (fileId) => {
  const response = await apiClient.get(`/api/v1/files/${fileId}`);
  return response.data;
};

// Delete file
export const deleteFile = async (fileId) => {
  const response = await apiClient.delete(`/api/v1/files/${fileId}`);
  return response.data;
};

// Send query
export const sendQuery = async (
  query,
  chatHistory = [],
  conversationId = null
) => {
  const response = await apiClient.post("/api/v1/query", {
    query,
    chat_history: chatHistory,
    conversation_id: conversationId,
  });
  return response.data;
};

// Authentication APIs
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_CONFIG.baseURL}/api/v1/auth/login`,
      {
        email,
        password,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Login failed. Please try again.");
  }
};

export const registerUser = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_CONFIG.baseURL}/api/v1/auth/register`,
      {
        email,
        password,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Registration failed. Please try again.");
  }
};

export const refreshAccessToken = async (refreshToken) => {
  const response = await axios.post(
    `${API_CONFIG.baseURL}/api/v1/auth/refresh`,
    {
      refresh_token: refreshToken,
    }
  );
  return response.data;
};

// Conversation APIs
export const getConversations = async () => {
  const response = await apiClient.get("/api/v1/conversations");
  return response.data;
};

export const getConversation = async (conversationId) => {
  const response = await apiClient.get(
    `/api/v1/conversations/${conversationId}`
  );
  return response.data;
};

export const createConversation = async (title = null) => {
  const response = await apiClient.post("/api/v1/conversations", {
    title,
  });
  return response.data;
};

export const updateConversation = async (conversationId, title) => {
  const response = await apiClient.put(
    `/api/v1/conversations/${conversationId}`,
    {
      title,
    }
  );
  return response.data;
};

export const deleteConversation = async (conversationId) => {
  const response = await apiClient.delete(
    `/api/v1/conversations/${conversationId}`
  );
  return response.data;
};

export const getConversationMessages = async (conversationId) => {
  const response = await apiClient.get(
    `/api/v1/conversations/${conversationId}/messages`
  );
  return response.data;
};

export default apiClient;
