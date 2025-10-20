import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import styled from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import { theme } from "./styles/theme";
import Navigation from "./components/Navigation";
import Chat from "./components/Chat";
import FilesDashboard from "./components/FilesDashboard";
import Login from "./components/Login";
import { useAuthStore } from "./store/authStore";
import { useChatStore } from "./store/chatStore";
import { useConversationStore } from "./store/conversationStore";

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow: hidden;
  margin-left: ${(props) => {
    if (props.$isCollapsed) return "60px";
    return `${props.$sidebarWidth}px`;
  }};
  transition: ${(props) => props.$isResizing ? "none" : "margin-left 0.3s ease"};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    margin-left: 0;
  }
`;

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearChat = useChatStore((state) => state.clearChat);

  // Initialize collapsed state based on screen size
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return window.innerWidth <= 768;
  });

  // Initialize sidebar width from localStorage or default
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    return savedWidth ? parseInt(savedWidth, 10) : 240;
  });

  const [isResizing, setIsResizing] = useState(false);

  // Save sidebar width to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarWidth', sidebarWidth.toString());
  }, [sidebarWidth]);

  const handleSidebarWidthChange = (newWidth) => {
    setSidebarWidth(newWidth);
  };

  const handleResizeStateChange = (resizing) => {
    setIsResizing(resizing);
  };

  // Clear all stores when authentication changes to false (logout)
  useEffect(() => {
    if (!isAuthenticated) {
      clearChat();
      useConversationStore.setState({
        conversations: [],
        currentConversationId: null,
        error: null,
      });
    }
  }, [isAuthenticated, clearChat]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <BrowserRouter>
        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <AppContainer>
            <Navigation
              isCollapsed={isSidebarCollapsed}
              onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              width={sidebarWidth}
              onWidthChange={handleSidebarWidthChange}
              onResizeStateChange={handleResizeStateChange}
            />
            <ContentArea 
              $isCollapsed={isSidebarCollapsed}
              $sidebarWidth={sidebarWidth}
              $isResizing={isResizing}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Chat onMenuClick={() => setIsSidebarCollapsed(false)} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/files"
                  element={
                    <ProtectedRoute>
                      <FilesDashboard
                        onMenuClick={() => setIsSidebarCollapsed(false)}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ContentArea>
          </AppContainer>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
