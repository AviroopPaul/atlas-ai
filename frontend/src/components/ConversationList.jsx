import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  IoAddOutline,
  IoChatbubbleOutline,
  IoTrashOutline,
  IoChatbubblesOutline,
} from "react-icons/io5";
import { useConversationStore } from "../store/conversationStore";
import { useChatStore } from "../store/chatStore";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${(props) => props.theme.colors.black};
  border-top: 2px solid ${(props) => props.theme.colors.white};
`;

const Header = styled.div`
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.lg};
  border-bottom: 2px solid ${(props) => props.theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: ${(props) =>
    props.$isCollapsed ? "center" : "space-between"};
  gap: ${(props) => props.theme.spacing.md};
`;

const Title = styled.h3`
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.colors.white};
  display: ${(props) => (props.$isCollapsed ? "none" : "flex")};
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const ChatIcon = styled.button`
  display: ${(props) => (props.$isCollapsed ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.white};
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const NewChatButton = styled.button`
  background: ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.black};
  border: 2px solid ${(props) => props.theme.colors.white};
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: ${(props) => props.theme.colors.black};
    color: ${(props) => props.theme.colors.white};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ConversationsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${(props) => props.theme.spacing.sm} 0;
`;

const ConversationItem = styled.div`
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.lg};
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid transparent;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  position: relative;
  background: ${(props) =>
    props.$isActive ? props.theme.colors.gray[900] : "transparent"};
  border-left-color: ${(props) =>
    props.$isActive ? props.theme.colors.white : "transparent"};

  &:hover {
    background: ${(props) => props.theme.colors.gray[900]};
    border-left-color: ${(props) => props.theme.colors.white};

    .actions {
      opacity: 1;
    }
  }
`;

const ConversationIcon = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colors.white};

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ConversationContent = styled.div`
  flex: 1;
  min-width: 0;
  display: ${(props) => (props.$isCollapsed ? "none" : "block")};
`;

const ConversationTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ConversationMeta = styled.div`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.gray[400]};
  margin-top: 2px;
`;

const ConversationActions = styled.div`
  display: ${(props) => (props.$isCollapsed ? "none" : "flex")};
  gap: ${(props) => props.theme.spacing.xs};
  opacity: 0;
  transition: opacity 0.2s;
`;

const ActionButton = styled.button`
  background: transparent;
  border: 1px solid ${(props) => props.theme.colors.gray[600]};
  color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.white};
    color: ${(props) => props.theme.colors.black};
    border-color: ${(props) => props.theme.colors.white};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyState = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  text-align: center;
  color: ${(props) => props.theme.colors.gray[500]};
  font-size: 0.875rem;
  display: ${(props) => (props.$isCollapsed ? "none" : "block")};
`;

const LoadingState = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  text-align: center;
  color: ${(props) => props.theme.colors.gray[500]};
  font-size: 0.875rem;
`;

function ConversationList({ isCollapsed, onToggle }) {
  const navigate = useNavigate();
  const conversations = useConversationStore((state) => state.conversations);
  const fetchConversations = useConversationStore(
    (state) => state.fetchConversations
  );
  const deleteConversation = useConversationStore(
    (state) => state.deleteConversation
  );
  const isLoading = useConversationStore((state) => state.isLoading);

  const loadConversation = useChatStore((state) => state.loadConversation);
  const startNewConversation = useChatStore(
    (state) => state.startNewConversation
  );
  const currentConversationId = useChatStore(
    (state) => state.currentConversationId
  );
  const setOnConversationUpdate = useChatStore(
    (state) => state.setOnConversationUpdate
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Register callback to refresh conversations when a new one is created or updated
  useEffect(() => {
    setOnConversationUpdate(() => {
      // Always refresh the list
      fetchConversations();
    });
  }, [setOnConversationUpdate, fetchConversations]);

  const handleNewChat = async () => {
    try {
      startNewConversation();
      await fetchConversations(); // Refresh list
      navigate("/"); // Navigate to chat page
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleSelectConversation = async (conversationId) => {
    try {
      await loadConversation(conversationId);
      navigate("/"); // Navigate to chat page
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );
    if (confirmed) {
      try {
        await deleteConversation(conversationId);
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <Container>
      <Header $isCollapsed={isCollapsed}>
        {isCollapsed ? (
          <ChatIcon
            $isCollapsed={isCollapsed}
            onClick={onToggle}
            title="Expand sidebar"
          >
            <IoChatbubblesOutline />
          </ChatIcon>
        ) : (
          <>
            <Title>Chats</Title>
            <NewChatButton onClick={handleNewChat} title="New conversation">
              <IoAddOutline />
            </NewChatButton>
          </>
        )}
      </Header>

      <ConversationsList>
        {isLoading && conversations.length === 0 ? (
          <LoadingState>Loading...</LoadingState>
        ) : conversations.length === 0 ? (
          <EmptyState $isCollapsed={isCollapsed}>
            No conversations yet. Start a new chat!
          </EmptyState>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              $isActive={currentConversationId === conv.id}
            >
              <ConversationIcon>
                <IoChatbubbleOutline />
              </ConversationIcon>
              <ConversationContent $isCollapsed={isCollapsed}>
                <ConversationTitle>
                  {conv.title || "New Conversation"}
                </ConversationTitle>
                <ConversationMeta>
                  {conv.message_count} messages · {formatDate(conv.updated_at)}
                </ConversationMeta>
              </ConversationContent>
              <ConversationActions
                className="actions"
                $isCollapsed={isCollapsed}
              >
                <ActionButton
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  title="Delete conversation"
                >
                  <IoTrashOutline />
                </ActionButton>
              </ConversationActions>
            </ConversationItem>
          ))
        )}
      </ConversationsList>
    </Container>
  );
}

export default ConversationList;
