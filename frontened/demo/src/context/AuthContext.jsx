import React, { useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to validate JWT format
  const isValidJWT = (token) => {
    if (!token) return false;
    // JWT should have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
  };

  // Function to safely decode token
  const safelyDecodeToken = (token) => {
    try {
      return isValidJWT(token) ? jwtDecode(token) : null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Set initial user and login state on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      const decodedUser = safelyDecodeToken(storedToken);
      if (decodedUser) {
        setAccessToken(storedToken);
        setUser(decodedUser);
        setIsLoggedIn(true);
      } else {
        // Invalid token, clean up
        localStorage.removeItem("accessToken");
        setAccessToken(null);
        setUser(null);
        setIsLoggedIn(false);
      }
    }
  }, []);

  const login = (token) => {
    if (!token) {
      console.error("No token provided");
      return false;
    }
    
    if (!isValidJWT(token)) {
      console.error("Invalid token format");
      return false;
    }
    
    try {
      const decodedUser = jwtDecode(token);
      setAccessToken(token);
      localStorage.setItem("accessToken", token);
      setUser(decodedUser);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsLoggedIn(false);
  };

  const value = {
    accessToken,
    user,
    isLoggedIn,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}