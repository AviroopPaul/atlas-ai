import { create } from "zustand";
import {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  getConversationMessages,
} from "../api/client";

export const useConversationStore = create((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  error: null,

  // Fetch all conversations
  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getConversations();
      set({ conversations: response.conversations, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Create new conversation
  createNewConversation: async (title = null) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await createConversation(title);
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        currentConversationId: conversation.id,
        isLoading: false,
      }));
      return conversation;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Select a conversation
  selectConversation: (conversationId) => {
    set({ currentConversationId: conversationId });
  },

  // Update conversation title
  updateConversationTitle: async (conversationId, title) => {
    try {
      const updated = await updateConversation(conversationId, title);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, title: updated.title } : conv
        ),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    try {
      await deleteConversation(conversationId);
      set((state) => ({
        conversations: state.conversations.filter(
          (conv) => conv.id !== conversationId
        ),
        currentConversationId:
          state.currentConversationId === conversationId
            ? null
            : state.currentConversationId,
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Clear current conversation
  clearCurrentConversation: () => {
    set({ currentConversationId: null });
  },

  // Get conversation by ID from store
  getConversationById: (conversationId) => {
    const state = get();
    return state.conversations.find((conv) => conv.id === conversationId);
  },
}));
