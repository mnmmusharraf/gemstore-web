import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import { loginUser, registerUser, getCurrentUser } from "../api/auth";

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadUserFromToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("token");
      const token = tokenFromUrl || localStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser(token);
        setCurrentUser(user);
        localStorage.setItem("authToken", token); // store token
        if (tokenFromUrl) {
          // remove token from URL
          window.history.replaceState({}, "", "/");
        }
      } catch (err) {
        console.error("Failed to load user from token", err);
        localStorage.removeItem("authToken");
      } finally {
        setLoading(false);
      }
    };

    loadUserFromToken();
  }, []);


  const login = async (identifier, password) => {
    setAuthLoading(true);
    setErrorMessage("");

    try {
      const result = await loginUser({ identifier, password });
      localStorage.setItem("authToken", result.token);
      setCurrentUser(result.user);
      return true;
    } catch (err) {
      setErrorMessage(err.message || "Login failed");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (payload) => {
    setAuthLoading(true);
    setErrorMessage("");

    try {
      const result = await registerUser(payload);
      localStorage.setItem("authToken", result.token);
      setCurrentUser(result.user);
      return true;
    } catch (err) {
      setErrorMessage(err.message || "Registration failed");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        authLoading,
        errorMessage,
        login,
        register,
        logout,
        setErrorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
