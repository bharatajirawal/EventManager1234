import React, { useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";  // Corrected import

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({children}){
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
  const [user, setUser] = useState(accessToken ? jwtDecode(accessToken) : null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!accessToken);
  const login = (token) => {
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
    setUser(jwtDecode(token));
    setIsLoggedIn(true);
  };

  const value = {
    accessToken,
    setAccessToken,
    isLoggedIn,
    setIsLoggedIn,
    login,
    user,
  };
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !isLoggedIn) {
      setIsLoggedIn(true); // Update state to keep user logged in if token exists
    }
  }, [isLoggedIn]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}