import { useState, useEffect } from 'react';
import { registerUser, loginUser, getCurrentUser } from './api';
import MainPage from './MainPage';
import './styles/App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Common fields
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  // Extra fields for registration
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [emailForRegister, setEmailForRegister] = useState('');

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');

  // added: show/hide password toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // On first load: handle Google redirect OR existing token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    const loadUserFromToken = async (token) => {
      try {
        const user = await getCurrentUser(token);
        setCurrentUser(user);
      } catch {
        localStorage.removeItem('authToken');
      }
    };

    if (tokenFromUrl) {
      localStorage.setItem('authToken', tokenFromUrl);
      window.history.replaceState({}, '', '/');
      loadUserFromToken(tokenFromUrl);
    } else {
      const stored = localStorage.getItem('authToken');
      if (stored) {
        loadUserFromToken(stored);
      }
    }
  }, []);

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const payload = {
        displayName,
        username,
        email: emailForRegister,
        password,
      };

      const result = await registerUser(payload);
      localStorage.setItem('authToken', result.token);
      setCurrentUser(result.user);
      alert('Registration successful!');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const payload = {
        identifier: emailOrUsername,
        password,
      };

      const result = await loginUser(payload);
      localStorage.setItem('authToken', result.token);
      setCurrentUser(result.user);
      alert('Login successful!');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('authToken');
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter your email to reset your password.');
      return;
    }
    try {
      setLoading(true);
      // TODO: call your backend /api/auth/forgot-password here
      alert('If an account exists for this email, a reset link has been sent.');
      setErrorMessage('');
      setMode('login');
      setEmailOrUsername(forgotEmail);
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    return <MainPage currentUser={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="ig-root">
      <div className="ig-single-layout">
        <div className="ig-card">
          {/* HEADER / TITLE VARIES BY MODE */}
          {mode === 'login' && (
            <>
              <div className="ig-logo">Gemstore</div>
              <div className="ig-subtitle">
                Sign in to explore and trade gemstones.
              </div>
            </>
          )}

          {mode === 'register' && (
            <>
              <div className="ig-logo">Gemstore</div>
              <div className="ig-subtitle">
                Create an account to start selling and buying gems.
              </div>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <div className="ig-logo-small">Gemstore</div>
              <div className="ig-subtitle">
                Trouble logging in? Enter your email and we&apos;ll send you a link to get back into your account.
              </div>
            </>
          )}

          {errorMessage && <div className="ig-error">{errorMessage}</div>}

          {/* LOGIN PAGE */}
          {mode === 'login' && (
            <>
              <form className="ig-form" onSubmit={handleLoginSubmit}>
                <input
                  className="ig-input"
                  type="text"
                  placeholder="Email or Username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  autoComplete="off"
                  required
                />

                {/* password with show/hide toggle */}
                <div className="ig-password-wrapper">
                  <input
                    className="ig-input ig-password-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    required
                  />
                  <button
                    type="button"
                    className="ig-password-toggle"
                    onClick={() => setShowLoginPassword((v) => !v)}
                  >
                    {showLoginPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="ig-primary-btn"
                  disabled={loading}
                >
                  {loading ? 'Logging in…' : 'Log in'}
                </button>

                <div className="ig-divider">
                  <span>or</span>
                </div>

                <button
                  type="button"
                  className="ig-google-btn"
                  onClick={handleGoogleSignIn}
                >
                  <span className="ig-google-icon">G</span>
                  <span>Continue with Google</span>
                </button>
              </form>

              <div className="ig-forgot-row" style={{ justifyContent: 'center' }}>
                <button
                  type="button"
                  className="ig-forgot-link"
                  onClick={() => {
                    setForgotEmail(emailOrUsername || '');
                    setErrorMessage('');
                    setMode('forgot');
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div className="ig-alt-action">
                <span>Don&apos;t have an account?</span>
                <button
                  type="button"
                  className="ig-link-btn"
                  onClick={() => handleSwitchMode('register')}
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {/* REGISTER PAGE */}
          {mode === 'register' && (
            <>
              <form className="ig-form" onSubmit={handleRegisterSubmit}>
                <input
                  className="ig-input"
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="off"
                  required
                />
                <input
                  className="ig-input"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  required
                />
                <input
                  className="ig-input"
                  type="email"
                  placeholder="Email"
                  value={emailForRegister}
                  onChange={(e) => setEmailForRegister(e.target.value)}
                  autoComplete="off"
                  required
                />

                {/* registration password with show/hide */}
                <div className="ig-password-wrapper">
                  <input
                    className="ig-input ig-password-input"
                    type={showRegisterPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    required
                  />
                  <button
                    type="button"
                    className="ig-password-toggle"
                    onClick={() => setShowRegisterPassword((v) => !v)}
                  >
                    {showRegisterPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="ig-primary-btn"
                  disabled={loading}
                >
                  {loading ? 'Signing up…' : 'Sign up'}
                </button>
              </form>

              <div className="ig-alt-action">
                <span>Already have an account?</span>
                <button
                  type="button"
                  className="ig-link-btn"
                  onClick={() => handleSwitchMode('login')}
                >
                  Log in
                </button>
              </div>
            </>
          )}

          {/* FORGOT PASSWORD PAGE */}
          {mode === 'forgot' && (
            <>
              <form className="ig-form" onSubmit={handleForgotPasswordSubmit}>
                <input
                  className="ig-input"
                  type="email"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoComplete="off"
                  required
                />

                <button
                  type="submit"
                  className="ig-primary-btn"
                  disabled={loading}
                >
                  {loading ? 'Sending…' : 'Send login link'}
                </button>
              </form>

              <div className="ig-alt-action">
                <button
                  type="button"
                  className="ig-link-btn"
                  onClick={() => handleSwitchMode('login')}
                >
                  Back to login
                </button>
              </div>
            </>
          )}
        </div>

        <div className="ig-footer">
          <span>© {new Date().getFullYear()} Gemstore</span>
        </div>
      </div>
    </div>
  );
}

export default App;