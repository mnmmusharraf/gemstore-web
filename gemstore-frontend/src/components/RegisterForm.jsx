import PasswordInput from "./PasswordInput";

export default function RegisterForm({
  displayName,
  setDisplayName,
  username,
  setUsername,
  emailForRegister,
  setEmailForRegister,
  password,
  setPassword,
  loading,
  showPassword,
  setShowPassword,
  onSubmit,
  switchToLogin,
}) {
  return (
    <>
      <form className="ig-form" onSubmit={onSubmit}>
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

        <button type="submit" className="ig-primary-btn" disabled={loading}>
          {loading ? "Signing up…" : "Sign up"}
        </button>
      </form>

      <div className="ig-alt-action">
        <span>Already have an account?</span>
        <button type="button" className="ig-link-btn" onClick={switchToLogin}>
          Log in
        </button>
      </div>
    </>
  );
}
