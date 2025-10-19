import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import { IoRocketOutline } from "react-icons/io5";
import { useChatStore } from "../store/chatStore";
import PageHeader from "./PageHeader";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${(props) => props.theme.colors.black};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.md};
  }
`;

const Message = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.lg};
  padding: ${(props) => props.theme.spacing.md};
  border: ${(props) => (props.isUser ? "2px" : "1px")} solid
    ${(props) => props.theme.colors.white};
  background: ${(props) =>
    props.isUser ? props.theme.colors.gray[800] : props.theme.colors.gray[900]};
  color: ${(props) => props.theme.colors.white};

  ${(props) =>
    !props.isUser &&
    `
    border-left: 4px solid ${props.theme.colors.white};
  `}
`;

const MessageHeader = styled.div`
  font-weight: 700;
  margin-bottom: ${(props) => props.theme.spacing.sm};
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
`;

const MessageContent = styled.div`
  line-height: 1.6;

  a {
    text-decoration: underline;
    font-weight: 600;
    color: ${(props) => props.theme.colors.white};

    &:hover {
      opacity: 0.7;
    }
  }

  code {
    background: ${(props) => props.theme.colors.gray[800]};
    color: ${(props) => props.theme.colors.white};
    padding: 0.125rem 0.25rem;
    border-radius: 2px;
  }

  pre {
    background: ${(props) => props.theme.colors.gray[800]};
    color: ${(props) => props.theme.colors.white};
    padding: ${(props) => props.theme.spacing.md};
    overflow-x: auto;
    margin: ${(props) => props.theme.spacing.sm} 0;
  }

  ul,
  ol {
    margin-left: ${(props) => props.theme.spacing.lg};
    margin-top: ${(props) => props.theme.spacing.sm};
  }

  p {
    margin-bottom: ${(props) => props.theme.spacing.sm};
  }
`;

const InputContainer = styled.form`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.lg};
  border-top: 2px solid ${(props) => props.theme.colors.white};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.md};
  }
`;

const Input = styled.input`
  flex: 1;
  padding: ${(props) => props.theme.spacing.md};
  border: 2px solid ${(props) => props.theme.colors.white};
  background: ${(props) => props.theme.colors.gray[900]};
  color: ${(props) => props.theme.colors.white};
  font-size: 1rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.gray[700]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.lg};
  background: ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.black};
  border: 2px solid ${(props) => props.theme.colors.white};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.black};
    color: ${(props) => props.theme.colors.white};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.md};
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  align-items: center;

  .dot {
    width: 8px;
    height: 8px;
    background: ${(props) => props.theme.colors.white};
    border-radius: 50%;
    animation: pulse 1.4s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }

  @keyframes pulse {
    0%,
    80%,
    100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    40% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${(props) => props.theme.spacing.xxl};
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${(props) => props.theme.spacing.lg};
  color: ${(props) => props.theme.colors.gray[600]};
`;

const EmptyStateTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.white};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const EmptyStateText = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.gray[400]};
  max-width: 400px;
`;

const ClearButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  background: transparent;
  color: ${(props) => props.theme.colors.white};
  border: 2px solid ${(props) => props.theme.colors.white};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.colors.white};
    color: ${(props) => props.theme.colors.black};
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.xs}
      ${(props) => props.theme.spacing.sm};
    font-size: 0.75rem;
  }
`;

function Chat({ onMenuClick }) {
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const isLoadingConversation = useChatStore(
    (state) => state.isLoadingConversation
  );
  const sendQueryAction = useChatStore((state) => state.sendQuery);
  const startNewConversation = useChatStore(
    (state) => state.startNewConversation
  );
  const currentConversationId = useChatStore(
    (state) => state.currentConversationId
  );
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const queryText = input;
    setInput("");

    try {
      await sendQueryAction(queryText, currentConversationId);
    } catch {
      // Error already handled in store
    }
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to start a new conversation? This will clear the current chat."
    );

    if (confirmed) {
      startNewConversation();
    }
  };

  // Show empty state if no conversation is selected and no messages
  if (!currentConversationId && messages.length === 0) {
    return (
      <ChatContainer>
        <PageHeader title="Chat" onMenuClick={onMenuClick} />
        <MessagesContainer>
          <EmptyStateContainer>
            <EmptyStateIcon>
              <IoRocketOutline />
            </EmptyStateIcon>
            <EmptyStateTitle>Ask me anything</EmptyStateTitle>
            <EmptyStateText>
              Start a conversation by typing a message below. I can help you
              with your documents, answer questions, and retrieve files.
            </EmptyStateText>
          </EmptyStateContainer>
        </MessagesContainer>
        <InputContainer onSubmit={handleSubmit}>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <IoRocketOutline size={24} />
          </Button>
        </InputContainer>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <PageHeader title="Chat" onMenuClick={onMenuClick}>
        {messages.length > 0 && (
          <ClearButton onClick={handleClearChat}>New Chat</ClearButton>
        )}
      </PageHeader>

      <MessagesContainer>
        {isLoadingConversation ? (
          <EmptyStateContainer>
            <LoadingIndicator>
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </LoadingIndicator>
          </EmptyStateContainer>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <Message key={idx} isUser={msg.role === "user"}>
                <MessageHeader>
                  {msg.role === "user" ? "You" : "Assistant"}
                </MessageHeader>
                <MessageContent>
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </MessageContent>
              </Message>
            ))}

            {isLoading && (
              <Message>
                <MessageHeader>Assistant</MessageHeader>
                <MessageContent>
                  <LoadingIndicator>
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </LoadingIndicator>
                </MessageContent>
              </Message>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </MessagesContainer>

      <InputContainer onSubmit={handleSubmit}>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isLoading || isLoadingConversation}
        />
        <Button
          type="submit"
          disabled={isLoading || isLoadingConversation || !input.trim()}
        >
          <IoRocketOutline size={24} />
        </Button>
      </InputContainer>
    </ChatContainer>
  );
}

export default Chat;
