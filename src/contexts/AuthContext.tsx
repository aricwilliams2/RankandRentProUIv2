import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import posthog from 'posthog-js';

import { User, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  // Check for stored user on app start
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser({
            ...userData,
            created_at: new Date(userData.created_at),
            updated_at: new Date(userData.updated_at),
          });
          setToken(storedToken);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://newrankandrentapi.onrender.com'}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const userData = {
        ...data.user,
        created_at: new Date(data.user.created_at),
        updated_at: new Date(data.user.updated_at),
      };

      setUser(userData);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);

      // Track successful login
      posthog.identify(userData.id, {
        email: userData.email,
        name: userData.name,
        created_at: userData.created_at,
      });
      posthog.capture('user_logged_in', {
        user_id: userData.id,
        email: userData.email,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      // Track failed login
      posthog.capture('login_failed', {
        email: email,
        error: err instanceof Error ? err.message : "Login failed",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://newrankandrentapi.onrender.com'}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      const userData = {
        ...data.user,
        id: String(data.user.id),
        created_at: new Date(data.user.created_at),
        updated_at: new Date(data.user.updated_at),
      };

      setUser(userData);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);

      // Track successful registration
      posthog.identify(userData.id, {
        email: userData.email,
        name: userData.name,
        created_at: userData.created_at,
      });
      posthog.capture('user_registered', {
        user_id: userData.id,
        email: userData.email,
        name: userData.name,
      });

      return userData;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      // Track failed registration
      posthog.capture('registration_failed', {
        email: email,
        name: name,
        error: err instanceof Error ? err.message : "Registration failed",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Track logout event
    if (user) {
      posthog.capture('user_logged_out', {
        user_id: user.id,
        email: user.email,
      });
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
