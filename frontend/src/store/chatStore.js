import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sendQuery } from "../api/client";

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,

      // Add message
      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      // Send query
      sendQuery: async (queryText) => {
        const { addMessage, messages } = get();

        // Add user message
        const userMessage = { role: "user", content: queryText };
        addMessage(userMessage);

        set({ isLoading: true });

        try {
          // Build chat history from previous messages (excluding the current user message we just added)
          const chatHistory = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

          const response = await sendQuery(queryText, chatHistory);
          const assistantMessage = {
            role: "assistant",
            content: response.markdown_response,
            sources: response.sources,
            intent: response.intent,
          };
          addMessage(assistantMessage);
          return response;
        } catch (error) {
          const errorMessage = {
            role: "assistant",
            content: `Error: ${error.response?.data?.detail || error.message}`,
            isError: true,
          };
          addMessage(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Clear chat
      clearChat: () => {
        set({ messages: [] });
      },
    }),
    {
      name: "chat-storage", // localStorage key
      partialize: (state) => ({ messages: state.messages }), // Only persist messages
    }
  )
);
