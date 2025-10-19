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

const LoadingDots = styled.div`
  display: inline-block;

  &::after {
    content: "...";
    animation: dots 1.5s steps(4, end) infinite;
  }

  @keyframes dots {
    0%,
    20% {
      content: ".";
    }
    40% {
      content: "..";
    }
    60%,
    100% {
      content: "...";
    }
  }
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
  const sendQueryAction = useChatStore((state) => state.sendQuery);
  const clearChat = useChatStore((state) => state.clearChat);
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
      await sendQueryAction(queryText);
    } catch {
      // Error already handled in store
    }
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear the chat? This will remove all messages."
    );

    if (confirmed) {
      clearChat();
    }
  };

  return (
    <ChatContainer>
      <PageHeader title="Chat" onMenuClick={onMenuClick}>
        {messages.length > 0 && (
          <ClearButton onClick={handleClearChat}>Clear Chat</ClearButton>
        )}
      </PageHeader>

      <MessagesContainer>
        {messages.length === 0 && (
          <Message>
            <MessageHeader>System</MessageHeader>
            <MessageContent>
              Welcome! Ask me anything about your documents or request files.
              <br />
              <br />
              Examples:
              <ul>
                <li>What is my current role?</li>
                <li>Give me my resume</li>
                <li>Summarize all my documents</li>
              </ul>
            </MessageContent>
          </Message>
        )}

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
              <LoadingDots>Thinking</LoadingDots>
            </MessageContent>
          </Message>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer onSubmit={handleSubmit}>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <IoRocketOutline size={24} />
        </Button>
      </InputContainer>
    </ChatContainer>
  );
}

export default Chat;
