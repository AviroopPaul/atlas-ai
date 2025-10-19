import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'Source Code Pro', 'Courier New', monospace;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${(props) => props.theme.colors.black};
    color: ${(props) => props.theme.colors.white};
  }

  code {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'Source Code Pro', 'Courier New', monospace;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea {
    font-family: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.gray[800]};
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.gray[600]};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.colors.white};
  }
`;
