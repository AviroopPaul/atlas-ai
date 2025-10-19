import { create } from "zustand";
import { loginUser, registerUser, refreshAccessToken } from "../api/client";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const useAuthStore = create((set, get) => ({
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  isLoading: false,
  user: null,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await loginUser(email, password);
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      set({ isAuthenticated: true, isLoading: false, user: { email } });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await registerUser(email, password);
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      set({ isAuthenticated: true, isLoading: false, user: { email } });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ isAuthenticated: false, user: null });

    // Clear all other stores on logout
    if (typeof window !== "undefined") {
      // Import stores dynamically to avoid circular dependencies
      import("./chatStore").then(({ useChatStore }) => {
        useChatStore.getState().clearChat();
      });
      import("./conversationStore").then(({ useConversationStore }) => {
        useConversationStore.setState({
          conversations: [],
          currentConversationId: null,
          error: null,
        });
      });
      import("./filesStore")
        .then(({ useFilesStore }) => {
          useFilesStore.setState({ files: [] });
        })
        .catch(() => {
          // filesStore might not exist, ignore error
        });
    }
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      get().logout();
      return;
    }

    try {
      const response = await refreshAccessToken(refreshToken);
      localStorage.setItem(TOKEN_KEY, response.access_token);
      // Keep the same refresh token as backend returns it unchanged
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      set({ isAuthenticated: true });
    } catch (error) {
      get().logout();
      throw error;
    }
  },

  getAccessToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
}));
