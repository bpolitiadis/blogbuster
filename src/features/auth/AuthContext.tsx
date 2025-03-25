"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  xp?: number;
  badges?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Check if user is already logged in on mount
  useEffect(() => {
    const verifyUser = async () => {
      try {
        setIsLoading(true);
        await refreshToken();
        const userData = await fetchUserData();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to verify user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

  const fetchUserData = async (): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Important for sending cookies
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      setAccessToken(data.accessToken);
    } catch (error) {
      console.error("Error refreshing token:", error);
      setAccessToken(null);
      setUser(null);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      setAccessToken(data.accessToken);

      // Fetch user data with the new token
      const userData = await fetchUserData();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      // After successful registration, log the user in
      await login(email, password);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setAccessToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
