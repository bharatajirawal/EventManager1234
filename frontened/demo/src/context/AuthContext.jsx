import React, { useState, useEffect, useContext } from "react";
import jwtDecode from "jwt-decode";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
  const [user, setUser] = useState(accessToken ? jwtDecode(accessToken) : null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!accessToken);

  const login = (token) => {
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
    setUser(jwtDecode(token));
    setIsLoggedIn(true);
  };

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !isLoggedIn) {
      setIsLoggedIn(true);
    }
  }, [isLoggedIn]);

  const value = {
    accessToken,
    setAccessToken,
    isLoggedIn,
    setIsLoggedIn,
    login,
    logout,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}