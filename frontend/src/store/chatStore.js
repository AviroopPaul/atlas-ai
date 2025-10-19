import { create } from "zustand";
import { sendQuery, getConversationMessages } from "../api/client";

export const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  isLoadingConversation: false,
  currentConversationId: null,
  onConversationUpdate: null, // Callback to refresh conversation list

  // Set callback for conversation updates
  setOnConversationUpdate: (callback) => {
    set({ onConversationUpdate: callback });
  },

  // Load messages from a conversation
  loadConversation: async (conversationId) => {
    set({ isLoadingConversation: true, currentConversationId: conversationId });
    try {
      const messages = await getConversationMessages(conversationId);
      // Transform backend messages to frontend format
      const formattedMessages = messages.map((msg) => {
        let sources = null;
        if (msg.sources) {
          // If sources is already an object, use it directly
          if (typeof msg.sources === "object") {
            sources = msg.sources;
          } else if (typeof msg.sources === "string") {
            // If it's a string, try to parse it
            try {
              sources = JSON.parse(msg.sources);
            } catch (parseError) {
              console.error("Failed to parse sources:", parseError);
              sources = null;
            }
          }
        }

        return {
          role: msg.role,
          content: msg.content,
          sources,
          intent: msg.intent,
          created_at: msg.created_at,
        };
      });
      set({ messages: formattedMessages, isLoadingConversation: false });
    } catch (error) {
      // Clear the conversation ID on failure to maintain consistent state
      set({
        isLoadingConversation: false,
        currentConversationId: null,
        messages: [],
      });
      throw error;
    }
  },

  // Start a new conversation
  startNewConversation: () => {
    set({ messages: [], currentConversationId: null });
  },

  // Add message
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  // Send query
  sendQuery: async (queryText, conversationId = null) => {
    const { addMessage, messages, onConversationUpdate } = get();

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

      const response = await sendQuery(queryText, chatHistory, conversationId);
      const assistantMessage = {
        role: "assistant",
        content: response.markdown_response,
        sources: response.sources,
        intent: response.intent,
      };
      addMessage(assistantMessage);

      // Update current conversation ID if it was created
      const isNewConversation = !conversationId && response.conversation_id;
      if (response.conversation_id) {
        set({ currentConversationId: response.conversation_id });
      }

      // Refresh conversation list if callback is set
      if (onConversationUpdate) {
        onConversationUpdate(isNewConversation);
      }

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
    set({ messages: [], currentConversationId: null });
  },
}));
