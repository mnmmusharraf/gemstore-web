import PasswordInput from "./PasswordInput";

export default function LoginForm({
  emailOrUsername,
  setEmailOrUsername,
  password,
  setPassword,
  loading,
  showPassword,
  setShowPassword,
  onSubmit,
  onGoogleSignIn,
  switchToRegister,
  switchToForgot,
}) {
  return (
    <>
      <form className="ig-form" onSubmit={onSubmit}>
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

        <button type="submit" className="ig-primary-btn" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>

        <div className="ig-divider">
          <span>or</span>
        </div>

        <button type="button" className="ig-google-btn" onClick={onGoogleSignIn}>
          <span className="ig-google-icon">G</span>
          <span>Continue with Google</span>
        </button>
      </form>

      <div className="ig-forgot-row" style={{ justifyContent: "center" }}>
        <button type="button" className="ig-forgot-link" onClick={switchToForgot}>
          Forgot password?
        </button>
      </div>

      <div className="ig-alt-action">
        <span>Don't have an account?</span>
        <button type="button" className="ig-link-btn" onClick={switchToRegister}>
          Sign up
        </button>
      </div>
    </>
  );
}
