window.global = window;

import { Routes, Route, Navigate } from "react-router-dom";

import useAuth from "./hooks/auth/useAuth";
import HomePage from "./pages/HomePage/HomePage";
import AuthLayout from "./components/auth/AuthLayout";
import LoginForm from "./components/auth/forms/LoginForm";
import RegisterForm from "./components/auth/forms/RegisterForm";
import ForgotPasswordForm from "./components/auth/forms/ForgotPasswordForm";
import Processing from "./components/common/Processing";

function App() {
  const { currentUser, logout, loading, errorMessage } = useAuth();

  if (loading) {
    return <Processing text="Loading..." />;
  }

  return (
    <Routes>
      {/* ===== HOME ===== */}
      <Route
        path="/*"
        element={
          currentUser ? (
            <HomePage currentUser={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ===== AUTH ===== */}
      {/* We wrap the auth routes in AuthLayout. If logged in, kick them to Home */}
      <Route element={currentUser ? <Navigate to="/" replace /> : <AuthLayout errorMessage={errorMessage} />}>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      </Route>

      {/* Fallback for the old /auth URL, redirect to login */}
      <Route path="/auth" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;