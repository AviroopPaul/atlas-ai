import axios from "axios";
import { API_CONFIG } from "../config";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
export const sendQuery = async (query, chatHistory = []) => {
  const response = await apiClient.post("/api/v1/query", {
    query,
    chat_history: chatHistory,
  });
  return response.data;
};

export default apiClient;
