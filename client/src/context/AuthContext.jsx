import React, { createContext, useEffect, useState } from "react";
import { getStoredUser, removeUser, storeUser } from "../utils/storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (username) => {
    const user = { username };
    setCurrentUser(user);
    setIsAuthenticated(true);
    storeUser(user);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    removeUser();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
