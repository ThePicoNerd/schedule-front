import { createContext } from "react";

interface ContextData {
  token?: string;
  setToken: (token: string) => void;
}

export const Context = createContext<ContextData>({ setToken: () => {} });
