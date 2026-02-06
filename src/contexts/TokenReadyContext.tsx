/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface TokenReadyContextType {
  tokenReady: boolean;
  setTokenReady: (ready: boolean) => void;
}

const TokenReadyContext = createContext<TokenReadyContextType | undefined>(
  undefined
);

export const TokenReadyProvider = ({ children }: { children: ReactNode }) => {
  const [tokenReady, setTokenReady] = useState(false);

  return (
    <TokenReadyContext.Provider value={{ tokenReady, setTokenReady }}>
      {children}
    </TokenReadyContext.Provider>
  );
};

export const useTokenReady = (): boolean => {
  const context = useContext(TokenReadyContext);
  if (context === undefined) {
    return false;
  }
  return context.tokenReady;
};

export const useSetTokenReady = (): ((ready: boolean) => void) => {
  const context = useContext(TokenReadyContext);
  if (context === undefined) {
    return () => {};
  }
  return context.setTokenReady;
};
