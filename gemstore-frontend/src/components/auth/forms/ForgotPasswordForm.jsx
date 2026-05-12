import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useForgotPasswordForm from "../../../hooks/auth/useForgotPasswordForm";
import useAuth from "../../../hooks/auth/useAuth";

export default function ForgotPasswordForm() {
  const { forgotEmail, setForgotEmail } = useForgotPasswordForm();
  const { authLoading } = useAuth();
  
  // Hooks for Router
  const location = useLocation();
  const navigate = useNavigate();

  // Pre-fill the email from Router state
  useEffect(() => {
    if (location.state?.email) {
      setForgotEmail(location.state.email);
    }
  }, [location.state, setForgotEmail]);

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    toast.info("If an account exists, a reset link has been sent.");
    navigate("/login"); // Automatically send them back to login
  };

  return (
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

        <button type="submit" className="ig-primary-btn" disabled={authLoading}>
          {authLoading ? "Sending…" : "Send login link"}
        </button>
      </form>

      <div className="ig-alt-action">
        <Link to="/login" className="ig-link-btn" style={{ textDecoration: "none" }}>
          Back to login
        </Link>
      </div>
    </>
  );
}