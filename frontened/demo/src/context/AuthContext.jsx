import React, { useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));

  const isValidJWT = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const safelyDecodeToken = (token) => {
    try {
      if (!isValidJWT(token)) return null;
      const decoded = jwtDecode(token);
      return {
        id: decoded.sub || decoded.id, // Standard JWT uses 'sub' for user ID
        name: decoded.name,
        email: decoded.email,
        // Add any other claims you expect
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken && isValidJWT(storedToken)) {
      const decodedUser = safelyDecodeToken(storedToken);
      if (decodedUser) {
        setAccessToken(storedToken);
        setUser(decodedUser);
        setIsLoggedIn(true);
        // Update localStorage in case structure changed
        localStorage.setItem("user", JSON.stringify(decodedUser));
      } else {
        cleanupAuth();
      }
    } else {
      cleanupAuth();
    }
  }, []);

  const cleanupAuth = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  const login = (token, userData = null) => {
    if (!token || !isValidJWT(token)) {
      console.error("Invalid token");
      return false;
    }

    try {
      const decodedUser = userData || safelyDecodeToken(token);
      if (!decodedUser || !decodedUser.email) {
        throw new Error("Invalid user data in token");
      }

      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(decodedUser));
      
      setAccessToken(token);
      setUser(decodedUser);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      cleanupAuth();
      return false;
    }
  };

  const logout = () => {
    cleanupAuth();
  };

  const value = {
    accessToken,
    user,
    isLoggedIn,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}