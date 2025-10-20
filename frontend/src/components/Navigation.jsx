import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { IoLogOutOutline } from "react-icons/io5";
import { useAuthStore } from "../store/authStore";
import ConversationList from "./ConversationList";
import { useState, useCallback, useRef, useEffect } from "react";

const SidebarContainer = styled.div`
  position: relative;
  height: 100%;
`;

const Sidebar = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${(props) => {
    if (props.$isCollapsed) return "60px";
    return `${props.$width}px`;
  }};
  background: ${(props) => props.theme.colors.black};
  border-right: 2px solid ${(props) => props.theme.colors.white};
  display: flex;
  flex-direction: column;
  transition: ${(props) => (props.$isResizing ? "none" : "width 0.3s ease")};
  z-index: 1000;
  overflow: hidden;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    width: ${(props) => (props.$isCollapsed ? "0" : "240px")};
    border-right: ${(props) =>
      props.$isCollapsed ? "none" : "2px solid white"};
  }
`;

const ResizeHandle = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
  z-index: 1001;

  &:hover {
    background: ${(props) => props.theme.colors.white};
    opacity: 0.3;
  }

  &:active {
    background: ${(props) => props.theme.colors.white};
    opacity: 0.5;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    display: inline-block;
    vertical-align: middle;
  }
`;

const Header = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  border-bottom: 2px solid ${(props) => props.theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: ${(props) =>
    props.$isCollapsed ? "center" : "space-between"};
  height: 80px;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.md};
    height: 60px;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${(props) => props.theme.colors.white};
    white-space: nowrap;
    opacity: ${(props) => (props.$isCollapsed ? "0" : "1")};
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const ToggleButton = styled.button`
  background: transparent;
  border: 2px solid ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.white};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  padding: 0;

  &:hover {
    background: ${(props) => props.theme.colors.white};
    color: ${(props) => props.theme.colors.black};
  }

  svg {
    width: 20px;
    height: 20px;
    display: block;
  }
`;

const MobileOverlay = styled.div`
  display: none;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: ${(props) => (props.$isCollapsed ? "none" : "block")};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing.md} 0;
`;

const ConversationsSection = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const NavFooter = styled.div``;

const LogoutButton = styled.button`
  width: 100%;
  padding: ${(props) => props.theme.spacing.lg};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.colors.white};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  gap: ${(props) => props.theme.spacing.md};
  border: none;
  border-left: 4px solid transparent;
  background: transparent;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: ${(props) => props.theme.colors.gray[900]};
    border-left-color: ${(props) => props.theme.colors.white};
  }

  svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  span {
    display: ${(props) => (props.$isCollapsed ? "none" : "inline")};
  }
`;

const UserEmail = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  color: ${(props) => props.theme.colors.gray[400]};
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: ${(props) => (props.$isCollapsed ? "none" : "block")};
`;

const NavItem = styled(NavLink)`
  padding: ${(props) => props.theme.spacing.lg};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.colors.white};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  gap: ${(props) => props.theme.spacing.md};
  border-left: 4px solid transparent;
  white-space: nowrap;

  &:hover {
    background: ${(props) => props.theme.colors.gray[900]};
    border-left-color: ${(props) => props.theme.colors.white};
  }

  &.active {
    background: ${(props) => props.theme.colors.white};
    color: ${(props) => props.theme.colors.black};
    border-left-color: ${(props) => props.theme.colors.white};
  }

  svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  span {
    display: ${(props) => (props.$isCollapsed ? "none" : "inline")};
  }
`;

function Navigation({
  isCollapsed,
  onToggle,
  width = 240,
  onWidthChange,
  onResizeStateChange,
}) {
  const logout = useAuthStore((state) => state.logout);
  const userEmail = useAuthStore((state) => state.user?.email);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      // Clear all state and logout
      logout();
      // Force a page reload to ensure clean state
      window.location.href = "/login";
    }
  };

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      setIsResizing(true);
      onResizeStateChange?.(true);
    },
    [onResizeStateChange]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      const minWidth = 280;
      const maxWidth = 500;

      // Clamp the width between min and max
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      onWidthChange?.(clampedWidth);
    },
    [isResizing, onWidthChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    onResizeStateChange?.(false);
  }, [onResizeStateChange]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <>
      <MobileOverlay $isCollapsed={isCollapsed} onClick={onToggle} />

      <SidebarContainer>
        <Sidebar
          ref={sidebarRef}
          $isCollapsed={isCollapsed}
          $width={width}
          $isResizing={isResizing}
        >
          <Header $isCollapsed={isCollapsed}>
            {isCollapsed ? (
              <ToggleButton onClick={onToggle} title="Expand sidebar">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </ToggleButton>
            ) : (
              <>
                <h2>
                  <TitleContainer>
                    <img src="/atlas-ai.png" alt="Atlas AI logo" />
                    <span>atlas ai</span>
                  </TitleContainer>
                </h2>
                <ToggleButton onClick={onToggle} title="Collapse sidebar">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </ToggleButton>
              </>
            )}
          </Header>

          <NavList>
            <NavItem to="/files" $isCollapsed={isCollapsed}>
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Files</span>
            </NavItem>
          </NavList>

          <ConversationsSection>
            <ConversationList isCollapsed={isCollapsed} onToggle={onToggle} />
          </ConversationsSection>

          <NavFooter>
            {userEmail && (
              <UserEmail $isCollapsed={isCollapsed} title={userEmail}>
                {userEmail}
              </UserEmail>
            )}
            <LogoutButton onClick={handleLogout} $isCollapsed={isCollapsed}>
              <IoLogOutOutline />
              <span>Logout</span>
            </LogoutButton>
          </NavFooter>

          {!isCollapsed && <ResizeHandle onMouseDown={handleMouseDown} />}
        </Sidebar>
      </SidebarContainer>
    </>
  );
}

export default Navigation;
