import { NavLink } from "react-router-dom";
import styled from "styled-components";

const SidebarContainer = styled.div`
  position: relative;
  height: 100%;
`;

const Sidebar = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${(props) => (props.$isCollapsed ? "60px" : "240px")};
  background: ${(props) => props.theme.colors.black};
  border-right: 2px solid ${(props) => props.theme.colors.white};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 1000;
  overflow: hidden;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    width: ${(props) => (props.$isCollapsed ? "0" : "240px")};
    border-right: ${(props) =>
      props.$isCollapsed ? "none" : "2px solid white"};
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
  flex: 1;
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

function Navigation({ isCollapsed, onToggle }) {
  return (
    <>
      <MobileOverlay $isCollapsed={isCollapsed} onClick={onToggle} />

      <SidebarContainer>
        <Sidebar $isCollapsed={isCollapsed}>
          <Header $isCollapsed={isCollapsed}>
            {!isCollapsed && (
              <h2>
                <TitleContainer>
                  <img src="/atlas-ai.png" alt="Atlas AI logo" />
                  <span>atlas ai</span>
                </TitleContainer>
              </h2>
            )}
            <ToggleButton onClick={onToggle}>
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isCollapsed ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                )}
              </svg>
            </ToggleButton>
          </Header>

          <NavList>
            <NavItem to="/" $isCollapsed={isCollapsed}>
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>Chat</span>
            </NavItem>

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
        </Sidebar>
      </SidebarContainer>
    </>
  );
}

export default Navigation;
