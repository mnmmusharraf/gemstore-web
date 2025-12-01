import { useState, useEffect } from 'react';
import { registerUser, loginUser, getCurrentUser } from './api';
import MainPage from './MainPage';
import AuthLayout from './components/AuthLayout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Shared login fields
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [emailForRegister, setEmailForRegister] = useState("");

  // Forgot password field
  const [forgotEmail, setForgotEmail] = useState("");

  // Password toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Load token or google login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    const loadUserFromToken = async (token) => {
      try {
        const user = await getCurrentUser(token);
        setCurrentUser(user);
      } catch {
        localStorage.removeItem("authToken");
      }
    };

    if (tokenFromUrl) {
      localStorage.setItem("authToken", tokenFromUrl);
      window.history.replaceState({}, "", "/");
      loadUserFromToken(tokenFromUrl);
    } else {
      const stored = localStorage.getItem("authToken");
      if (stored) loadUserFromToken(stored);
    }
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("authToken");
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  // LOGIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const result = await loginUser({
        identifier: emailOrUsername,
        password,
      });

      localStorage.setItem("authToken", result.token);
      setCurrentUser(result.user);
      alert("Login successful!");
    } catch (err) {
      setErrorMessage(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const result = await registerUser({
        displayName,
        username,
        email: emailForRegister,
        password,
      });

      localStorage.setItem("authToken", result.token);
      setCurrentUser(result.user);
      alert("Registration successful!");
    } catch (err) {
      setErrorMessage(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      alert("If an account exists, a reset link has been sent.");
      setMode("login");
      setEmailOrUsername(forgotEmail);
    } catch {
      setErrorMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    return <MainPage currentUser={currentUser} onLogout={handleLogout} />;
  }

  return (
    <AuthLayout mode={mode} errorMessage={errorMessage}>
      {mode === "login" && (
        <LoginForm
          emailOrUsername={emailOrUsername}
          setEmailOrUsername={setEmailOrUsername}
          password={password}
          setPassword={setPassword}
          loading={loading}
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
          loading={loading}
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
          loading={loading}
          onSubmit={handleForgotPasswordSubmit}
          switchToLogin={() => setMode("login")}
        />
      )}
    </AuthLayout>
  );
}

export default App;
