import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from '../services/api';
import { jwtDecode } from "jwt-decode"; 

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [loading, setLoading] = useState(true);

  // Logout - defined early to avoid TDZ
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const res = await api.get("users/profile/");
      // ✅ Standardized response audit: res.data.data contains the profile
      const userData = res.data.data || res.data;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout();
      return null;
    }
  };

  // On mount, validate token and fetch profile
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            logout();
          } else {
            await fetchUserProfile();
          }
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  // Login
  const login = async (credentials) => {
    try {
      const res = await api.post("users/login/", credentials);
      // ✅ Handle both standardized and non-standardized login responses
      const { access, refresh } = res.data.data || res.data;
      
      setToken(access);
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      
      const profile = await fetchUserProfile();
      const displayName = profile?.first_name || profile?.username || "User";
      toast.success(`Welcome back, ${displayName}!`);
      return profile;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || "Invalid credentials";
      toast.error(errorMsg);
      throw err;
    }
  };

  // Register
  const register = async (userData) => {
    try {
      await api.post("users/register/", userData);
      toast.success("Account created! Please login.");
    } catch (err) {
      toast.error(err.response?.data?.username?.[0] || "Registration failed");
      throw err;
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isLoggedIn: !!token && !!user,
    role: user?.role || 'guest',
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee',
    isUser: user?.role === 'user',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
