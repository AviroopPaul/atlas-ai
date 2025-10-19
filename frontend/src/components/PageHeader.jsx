import styled from "styled-components";

// Wrapper for mobile centering: overlay invisible placeholders for menu and right section
const HeaderContainer = styled.header`
  padding: ${(props) => props.theme.spacing.lg};
  border-bottom: 2px solid ${(props) => props.theme.colors.white};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  position: relative;
  height: 80px;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.md};
    height: 60px;
    gap: 0;
  }
`;

const MenuButton = styled.button`
  background: transparent;
  border: 2px solid ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.white};
  width: 44px;
  height: 44px;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${(props) => props.theme.colors.white};
    color: ${(props) => props.theme.colors.black};
  }

  svg {
    width: 24px;
    height: 24px;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: flex;
  }
`;

// This helper makes a visually-hidden placeholder with equal width to MenuButton and RightSection on mobile
const Placeholder = styled.div`
  width: 44px;
  height: 44px;
  display: none;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: flex;
    flex-shrink: 0;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.white};
  flex: 1;
  text-align: center;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    font-size: 1.25rem;
    text-align: center;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  min-width: 44px; /* Match menu button width for balance */

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: ${(props) => (props.$hideOnMobile ? "none" : "flex")};
  }
`;

function PageHeader({ title, children, onMenuClick }) {
  return (
    <HeaderContainer>
      <MenuButton onClick={onMenuClick} aria-label="Toggle menu">
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </MenuButton>
      <Title>{typeof title === "string" ? title.toLowerCase() : title}</Title>
      <RightSection $hideOnMobile={!children}>{children}</RightSection>
      {/* Add invisible placeholders left/right on mobile to center the title */}
      <Placeholder aria-hidden="true" />
      <Placeholder aria-hidden="true" style={{ position: "absolute", left: 0, visibility: "hidden" }} />
    </HeaderContainer>
  );
}

export default PageHeader;
