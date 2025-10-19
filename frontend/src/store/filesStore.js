import { create } from "zustand";
import { getFiles, deleteFile, uploadFile } from "../api/client";

export const useFilesStore = create((set, get) => ({
  files: [],
  isLoading: false,
  lastFetch: null,
  cacheTimeout: 30000, // 30 seconds

  // Check if cache is still valid
  isCacheValid: () => {
    const { lastFetch, cacheTimeout } = get();
    if (!lastFetch) return false;
    return Date.now() - lastFetch < cacheTimeout;
  },

  // Fetch files (with caching)
  fetchFiles: async (forceRefresh = false) => {
    const { isCacheValid, files } = get();

    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && isCacheValid() && files.length > 0) {
      return files;
    }

    set({ isLoading: true });
    try {
      const data = await getFiles();
      set({
        files: data.files || [],
        isLoading: false,
        lastFetch: Date.now(),
      });
      return data.files || [];
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Upload file
  uploadFile: async (file) => {
    try {
      const result = await uploadFile(file);
      // Refresh files after upload
      await get().fetchFiles(true);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Delete file
  deleteFile: async (fileId) => {
    try {
      const result = await deleteFile(fileId);
      // Update local state immediately
      set((state) => ({
        files: state.files.filter((f) => f.id !== fileId),
      }));
      return result;
    } catch (error) {
      // Refresh on error to sync state
      await get().fetchFiles(true);
      throw error;
    }
  },

  // Clear cache
  clearCache: () => {
    set({ files: [], lastFetch: null });
  },
}));
