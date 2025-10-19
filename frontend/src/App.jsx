import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import styled from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import { theme } from "./styles/theme";
import Navigation from "./components/Navigation";
import Chat from "./components/Chat";
import FilesDashboard from "./components/FilesDashboard";

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow: hidden;
  margin-left: ${(props) => (props.$isCollapsed ? "60px" : "240px")};
  transition: margin-left 0.3s ease;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    margin-left: 0;
  }
`;

function App() {
  // Initialize collapsed state based on screen size
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return window.innerWidth <= 768;
  });

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
        <AppContainer>
          <Navigation
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <ContentArea $isCollapsed={isSidebarCollapsed}>
            <Routes>
              <Route
                path="/"
                element={
                  <Chat onMenuClick={() => setIsSidebarCollapsed(false)} />
                }
              />
              <Route
                path="/files"
                element={
                  <FilesDashboard
                    onMenuClick={() => setIsSidebarCollapsed(false)}
                  />
                }
              />
            </Routes>
          </ContentArea>
        </AppContainer>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
