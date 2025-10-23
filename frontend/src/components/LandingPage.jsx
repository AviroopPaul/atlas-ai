import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { IoDocumentTextOutline, IoFolderOutline, IoSearchOutline } from "react-icons/io5";

const LandingContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${(props) => props.theme.colors.black};
  overflow-x: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${(props) => props.theme.spacing.xl} ${(props) => props.theme.spacing.xxl};
  border-bottom: 2px solid ${(props) => props.theme.colors.white};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.lg} ${(props) => props.theme.spacing.lg};
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${(props) => props.theme.colors.white};
`;

const LoginButton = styled.button`
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.xl};
  background: ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.black};
  border: 2px solid ${(props) => props.theme.colors.white};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.black};
    color: ${(props) => props.theme.colors.white};
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.lg};
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.xxl};
  position: relative;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.xl} ${(props) => props.theme.spacing.lg};
  }
`;

const HeroSection = styled.div`
  text-align: center;
  max-width: 900px;
  margin-bottom: ${(props) => props.theme.spacing.xxl};
  z-index: 2;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.colors.white};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  line-height: 1.1;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${(props) => props.theme.colors.gray[400]};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  line-height: 1.6;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    font-size: 1rem;
  }
`;

const CTAButton = styled.button`
  padding: ${(props) => props.theme.spacing.lg} ${(props) => props.theme.spacing.xxl};
  background: ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.black};
  border: 2px solid ${(props) => props.theme.colors.white};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 1.125rem;
  transition: all 0.2s;
  margin-top: ${(props) => props.theme.spacing.lg};

  &:hover {
    background: ${(props) => props.theme.colors.black};
    color: ${(props) => props.theme.colors.white};
    box-shadow: 0 0 0 4px ${(props) => props.theme.colors.gray[800]};
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.xl};
    font-size: 1rem;
  }
`;

const FeaturesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${(props) => props.theme.spacing.xl};
  max-width: 1200px;
  width: 100%;
  margin-top: ${(props) => props.theme.spacing.xxl};
  z-index: 2;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${(props) => props.theme.spacing.lg};
  }
`;

const FeatureCard = styled.div`
  border: 2px solid ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.xl};
  background: ${(props) => props.theme.colors.gray[900]};
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.gray[800]};
    transform: translateY(-4px);
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.lg};
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: ${(props) => props.theme.colors.white};
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.colors.white};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const FeatureDescription = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.gray[400]};
  line-height: 1.6;
`;

// Globe animation
const rotate = keyframes`
  from {
    transform: rotateY(0deg) rotateZ(-15deg);
  }
  to {
    transform: rotateY(360deg) rotateZ(-15deg);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const GlobeContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  opacity: 0.08;
  z-index: 1;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    width: 300px;
    height: 300px;
  }
`;

const Globe = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border: 2px solid ${(props) => props.theme.colors.white};
  border-radius: 50%;
  animation: ${rotate} 30s linear infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: ${(props) => props.theme.colors.white};
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${(props) => props.theme.colors.white};
  }
`;

const Meridian = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70%;
  height: 100%;
  border: 2px solid ${(props) => props.theme.colors.white};
  border-radius: 50%;
  transform: translate(-50%, -50%) rotateY(${props => props.$rotation}deg);
  border-left: none;
  border-right: none;
`;

const DocumentIcon = styled.div`
  position: absolute;
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  color: ${(props) => props.theme.colors.white};
  font-size: ${props => props.$size}rem;
  
  &:nth-child(1) {
    top: 10%;
    left: 20%;
  }
  
  &:nth-child(2) {
    top: 60%;
    left: 70%;
  }
  
  &:nth-child(3) {
    top: 80%;
    left: 30%;
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xl};
  border-top: 2px solid ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.gray[500]};
  font-size: 0.875rem;
`;

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: <IoDocumentTextOutline />,
      title: "Universal Knowledge Base",
      description: "Upload and organize all your documents, PDFs, Excel files, and more in one centralized location.",
    },
    {
      icon: <IoSearchOutline />,
      title: "Intelligent Query",
      description: "Ask questions in natural language and get instant, accurate answers from your entire knowledge base.",
    },
    {
      icon: <IoFolderOutline />,
      title: "Seamless Organization",
      description: "Keep all your files organized and accessible. Never lose track of important documents again.",
    },
  ];

  return (
    <LandingContainer>
      <Header>
        <Logo>ATLAS AI</Logo>
        <LoginButton onClick={handleGetStarted}>Login</LoginButton>
      </Header>

      <MainContent>
        <GlobeContainer>
          <Globe>
            <Meridian $rotation={30} />
            <Meridian $rotation={60} />
            <Meridian $rotation={90} />
          </Globe>
          <DocumentIcon $delay={0} $size={1.5}>
            <IoDocumentTextOutline />
          </DocumentIcon>
          <DocumentIcon $delay={1} $size={1.2}>
            <IoFolderOutline />
          </DocumentIcon>
          <DocumentIcon $delay={2} $size={1.3}>
            <IoDocumentTextOutline />
          </DocumentIcon>
        </GlobeContainer>

        <HeroSection>
          <Title>
            Your World of Knowledge,
            <br />
            One Query Away
          </Title>
          <Subtitle>
            Atlas AI transforms your scattered documents into an intelligent knowledge base.
            Upload PDFs, Excel files, and documents—then query them instantly with natural language.
            Your information, organized and accessible like never before.
          </Subtitle>
          <CTAButton onClick={handleGetStarted}>Get Started</CTAButton>
        </HeroSection>

        <FeaturesSection>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesSection>
      </MainContent>

      <Footer>
        © 2025 Atlas AI. Building the future of knowledge management.
      </Footer>
    </LandingContainer>
  );
}

export default LandingPage;
