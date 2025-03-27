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
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>;
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
        console.log("AuthContext: Verifying user on mount");
        setIsLoading(true);

        // Only attempt refresh if we have a refresh token cookie
        const hasRefreshToken = document.cookie.includes("refreshToken=");
        if (!hasRefreshToken) {
          console.log(
            "AuthContext: No refresh token found, skipping verification"
          );
          setIsLoading(false);
          return;
        }

        await refreshToken();
        const userData = await fetchUserData();
        if (userData) {
          console.log("AuthContext: User verified successfully", {
            userId: userData.id,
            username: userData.username,
          });
          setUser(userData);
        } else {
          console.log("AuthContext: No user data found");
        }
      } catch (error) {
        // Only log as error if it's not a 401 (which is expected when not logged in)
        if (error instanceof Error && !error.message.includes("401")) {
          console.error("AuthContext: Failed to verify user:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

  const fetchUserData = async (): Promise<User | null> => {
    try {
      console.log("AuthContext: Fetching user data");
      // Ensure we have a valid access token
      let currentToken = accessToken;
      if (!currentToken) {
        console.log("AuthContext: No access token, attempting refresh");
        try {
          currentToken = await refreshToken();
        } catch (error) {
          console.error("AuthContext: Failed to refresh token:", error);
          return null;
        }
      }

      // If we still don't have a token after refresh attempt, return null
      if (!currentToken) {
        console.log("AuthContext: Still no access token after refresh attempt");
        return null;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("AuthContext: Token invalid, attempting refresh");
          // Token is invalid, try to refresh
          try {
            currentToken = await refreshToken();
            // Retry the request with new token
            const retryResponse = await fetch("/api/auth/me", {
              headers: {
                Authorization: `Bearer ${currentToken}`,
              },
            });
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              console.log(
                "AuthContext: Successfully fetched user data after token refresh"
              );
              return data.user;
            }
          } catch (error) {
            console.error(
              "AuthContext: Failed to refresh token on retry:",
              error
            );
            return null;
          }
        }
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      console.log("AuthContext: Successfully fetched user data");
      return data.user;
    } catch (error) {
      console.error("AuthContext: Error fetching user data:", error);
      return null;
    }
  };

  const refreshToken = async (): Promise<string> => {
    try {
      console.log("AuthContext: Attempting to refresh token");
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Important for sending cookies
      });

      if (!response.ok) {
        console.error("AuthContext: Token refresh failed");
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      if (!data.accessToken) {
        throw new Error("No access token received from refresh");
      }

      console.log("AuthContext: Token refreshed successfully");
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error("AuthContext: Error refreshing token:", error);
      setAccessToken(null);
      setUser(null);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log("AuthContext: Starting login process");
      setIsLoading(true);

      console.log("AuthContext: Preparing login request");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      console.log(`AuthContext: Login response status: ${response.status}`);

      if (!response.ok) {
        const error = await response.json();
        console.error("AuthContext: Login failed with details:", {
          status: response.status,
          error: error.error,
          details: error.details,
        });
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      console.log("AuthContext: Login response received", {
        hasAccessToken: !!data.accessToken,
        hasUser: !!data.user,
      });

      if (!data.accessToken) {
        console.error("AuthContext: No access token in response");
        throw new Error("No access token received");
      }

      console.log("AuthContext: Setting access token");
      setAccessToken(data.accessToken);

      // Fetch user data with the new token
      console.log("AuthContext: Fetching user data after login");
      const userData = await fetchUserData();
      if (userData) {
        console.log("AuthContext: User data fetched successfully", {
          userId: userData.id,
          username: userData.username,
        });
        setUser(userData);
      } else {
        console.error("AuthContext: Failed to fetch user data after login");
        throw new Error("Failed to fetch user data after login");
      }
    } catch (error) {
      console.error("AuthContext: Login error:", {
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
                stack: error.stack,
              }
            : String(error),
      });
      setAccessToken(null);
      setUser(null);
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
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();
      if (!data.accessToken) {
        throw new Error("No access token received");
      }
      setAccessToken(data.accessToken);

      // After successful registration, fetch user data
      const userData = await fetchUserData();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setAccessToken(null);
      setUser(null);
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
    accessToken,
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
