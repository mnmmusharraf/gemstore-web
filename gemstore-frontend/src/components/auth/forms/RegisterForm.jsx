import { Link } from "react-router-dom";
import { toast } from "sonner";
import useRegisterForm from "../../../hooks/auth/useRegisterForm";
import useAuth from "../../../hooks/auth/useAuth";
import PasswordInput from "../inputs/PasswordInput";

export default function RegisterForm() {
  const {
    displayName,
    setDisplayName,
    username,
    setUsername,
    emailForRegister,
    setEmailForRegister,
    password,
    setPassword,
    showPassword,
    setShowPassword,
  } = useRegisterForm();

  const { register, authLoading } = useAuth();

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

  return (
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

        <PasswordInput
          value={password}
          setValue={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <button type="submit" className="ig-primary-btn" disabled={authLoading}>
          {authLoading ? "Signing up…" : "Sign up"}
        </button>
      </form>

      <div className="ig-alt-action">
        <span>Already have an account?</span>
        <Link to="/login" className="ig-link-btn" style={{ textDecoration: "none" }}>
          Log in
        </Link>
      </div>
    </>
  );
}