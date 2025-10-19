import { useState } from "react";
import styled from "styled-components";
import {
  IoRocketOutline,
  IoMailOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
import { useAuthStore } from "../store/authStore";

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${(props) => props.theme.colors.black};
  padding: ${(props) => props.theme.spacing.lg};
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 450px;
  border: 2px solid ${(props) => props.theme.colors.white};
  background: ${(props) => props.theme.colors.gray[900]};
  padding: ${(props) => props.theme.spacing.xxl};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.xl};
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  gap: ${(props) => props.theme.spacing.md};
`;

const LogoIcon = styled(IoRocketOutline)`
  font-size: 3rem;
  color: ${(props) => props.theme.colors.white};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.colors.white};
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${(props) => props.theme.colors.gray[400]};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  font-size: 0.875rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.colors.white};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.gray[400]};
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  padding-left: ${(props) => props.theme.spacing.xxl};
  border: 2px solid ${(props) => props.theme.colors.white};
  background: ${(props) => props.theme.colors.gray[800]};
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

  &::placeholder {
    color: ${(props) => props.theme.colors.gray[500]};
  }
`;

const Button = styled.button`
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.black};
  border: 2px solid ${(props) => props.theme.colors.white};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 1rem;
  transition: all 0.2s;
  margin-top: ${(props) => props.theme.spacing.md};

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.black};
    color: ${(props) => props.theme.colors.white};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.gray[800]};
  border: 2px solid #ff4444;
  color: #ff4444;
  font-size: 0.875rem;
  text-align: center;
`;

const ToggleText = styled.div`
  text-align: center;
  margin-top: ${(props) => props.theme.spacing.lg};
  color: ${(props) => props.theme.colors.gray[400]};
  font-size: 0.875rem;
`;

const ToggleLink = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.white};
  text-decoration: underline;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: ${(props) => props.theme.spacing.xs};

  &:hover {
    opacity: 0.7;
  }
`;

const PasswordHint = styled.div`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.gray[500]};
  margin-top: -${(props) => props.theme.spacing.xs};
`;

function Login() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (isRegisterMode && password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      if (isRegisterMode) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError("");
    setEmail("");
    setPassword("");
  };

  return (
    <LoginContainer>
      <LoginBox>
        <Logo>
          <LogoIcon />
        </Logo>
        <Title>{isRegisterMode ? "Register" : "Login"}</Title>
        <Subtitle>
          {isRegisterMode
            ? "Create an account to get started"
            : "Welcome back! Please login to continue"}
        </Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <InputWrapper>
              <InputIcon>
                <IoMailOutline size={20} />
              </InputIcon>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <InputWrapper>
              <InputIcon>
                <IoLockClosedOutline size={20} />
              </InputIcon>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete={
                  isRegisterMode ? "new-password" : "current-password"
                }
              />
            </InputWrapper>
            {isRegisterMode && (
              <PasswordHint>
                Password must be at least 8 characters long
              </PasswordHint>
            )}
          </InputGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Please wait..."
              : isRegisterMode
              ? "Create Account"
              : "Login"}
          </Button>
        </Form>

        <ToggleText>
          {isRegisterMode
            ? "Already have an account?"
            : "Don't have an account?"}
          <ToggleLink onClick={toggleMode} disabled={isLoading}>
            {isRegisterMode ? "Login" : "Register"}
          </ToggleLink>
        </ToggleText>
      </LoginBox>
    </LoginContainer>
  );
}

export default Login;
