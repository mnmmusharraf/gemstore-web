import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import { loginUser, registerUser, getCurrentUser } from "../api/auth";
import { getAuthToken, setAuthToken, removeAuthToken } from "../api/config";

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadUserFromToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("token");
      const storedToken = tokenFromUrl || getAuthToken();

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser(storedToken);
        setCurrentUser(user);
        setAuthToken(storedToken); // store token
        setAuthToken(storedToken); // update state
        if (tokenFromUrl) {
          // remove token from URL
          window.history.replaceState({}, "", "/");
        }
      } catch (err) {
        console.error("Failed to load user from token", err);
        removeAuthToken();
        setToken(null);
        // localStorage.removeItem("authToken");
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
      setAuthToken(result.token);
      setToken(result.token);
      // localStorage.setItem("authToken", result.token);
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
      setAuthToken(result.token);
      setToken(result.token);
      // localStorage.setItem("authToken", result.token);
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
    removeAuthToken();
    setToken(null);
    // localStorage.removeItem("authToken");
    setCurrentUser(null);
  };

  const isAuthenticated = !! token && !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated,
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
