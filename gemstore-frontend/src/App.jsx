window.global = window;

import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";  
import { toast } from "sonner";

import useAuth from "./hooks/useAuth";

import HomePage from "./pages/HomePage/HomePage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";

import AuthLayout from "./components/auth/AuthLayout";
import LoginForm from "./components/auth/forms/LoginForm";
import RegisterForm from "./components/auth/forms/RegisterForm";
import ForgotPasswordForm from "./components/auth/forms/ForgotPasswordForm";
import Processing from "./components/common/Processing";

function App() {

  const {
    currentUser,
    login,
    register,
    logout,
    loading,
    authLoading,
    errorMessage,
  } = useAuth();

  const [mode, setMode] = useState("login");

  // login
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // register
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [emailForRegister, setEmailForRegister] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // forgot
  const [forgotEmail, setForgotEmail] = useState("");

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(emailOrUsername, password);
    if (ok) toast.success("Login successful!");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const ok = await register({
      displayName,
      username,
      email: emailForRegister,
      password,
    });
    if (ok) toast.success("Registration successful!");
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    toast.info("If an account exists, a reset link has been sent.");
    setMode("login");
  };

  if (loading) {
    return <Processing text="Loading..." />;
  }

  return (
    <Routes>
      {/* ===== HOME ===== */}
      <Route
        path="/"
        element={
          currentUser ? (
            <HomePage currentUser={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/auth" />
          )
        }
      />

      {/* ===== AUTH ===== */}
      <Route
        path="/auth"
        element={
          currentUser ? (
            <Navigate to="/" />
          ) : (
            <AuthLayout mode={mode} errorMessage={errorMessage}>
              {mode === "login" && (
                <LoginForm
                  emailOrUsername={emailOrUsername}
                  setEmailOrUsername={setEmailOrUsername}
                  password={password}
                  setPassword={setPassword}
                  loading={authLoading}
                  showPassword={showLoginPassword}
                  setShowPassword={setShowLoginPassword}
                  onSubmit={handleLoginSubmit}
                  onGoogleSignIn={handleGoogleSignIn}
                  switchToRegister={() => setMode("register")}
                  switchToForgot={() => {
                    setForgotEmail(emailOrUsername);
                    setMode("forgot");
                  }}
                />
              )}

              {mode === "register" && (
                <RegisterForm
                  displayName={displayName}
                  setDisplayName={setDisplayName}
                  username={username}
                  setUsername={setUsername}
                  emailForRegister={emailForRegister}
                  setEmailForRegister={setEmailForRegister}
                  password={password}
                  setPassword={setPassword}
                  loading={authLoading}
                  showPassword={showRegisterPassword}
                  setShowPassword={setShowRegisterPassword}
                  onSubmit={handleRegisterSubmit}
                  switchToLogin={() => setMode("login")}
                />
              )}

              {mode === "forgot" && (
                <ForgotPasswordForm
                  forgotEmail={forgotEmail}
                  setForgotEmail={setForgotEmail}
                  loading={authLoading}
                  onSubmit={handleForgotPasswordSubmit}
                  switchToLogin={() => setMode("login")}
                />
              )}
            </AuthLayout>
          )
        }
      />

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;