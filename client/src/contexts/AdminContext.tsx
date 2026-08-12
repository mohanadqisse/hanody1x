import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
}

const AdminContext = createContext<AdminContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  token: null,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("admin_token");
  });

  const isAuthenticated = !!token;

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("admin_token", newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("admin_token");
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, login, logout, token }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
