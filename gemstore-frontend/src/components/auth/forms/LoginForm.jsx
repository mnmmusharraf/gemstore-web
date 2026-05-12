import { Link } from "react-router-dom";
import { toast } from "sonner";
import useLoginForm from "../../../hooks/auth/useLoginForm";
import useAuth from "../../../hooks/auth/useAuth";
import PasswordInput from "../inputs/PasswordInput";

export default function LoginForm() {
  const {
    emailOrUsername,
    setEmailOrUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
  } = useLoginForm();

  const { login, authLoading } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(emailOrUsername, password);
    if (ok) toast.success("Login successful!");
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
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

        <PasswordInput
          value={password}
          setValue={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <button type="submit" className="ig-primary-btn" disabled={authLoading}>
          {authLoading ? "Logging in…" : "Log in"}
        </button>

        <div className="ig-divider">
          <span>or</span>
        </div>

        <button type="button" className="ig-google-btn" onClick={handleGoogleSignIn}>
          <span className="ig-google-icon">G</span>
          <span>Continue with Google</span>
        </button>
      </form>

      <div className="ig-forgot-row" style={{ justifyContent: "center" }}>
        {/* Pass the typed email safely through React Router state */}
        <Link 
          to="/forgot-password" 
          state={{ email: emailOrUsername }} 
          className="ig-forgot-link"
          style={{ textDecoration: "none" }}
        >
          Forgot password?
        </Link>
      </div>

      <div className="ig-alt-action">
        <span>Don't have an account?</span>
        <Link to="/register" className="ig-link-btn" style={{ textDecoration: "none" }}>
          Sign up
        </Link>
      </div>
    </>
  );
}