export default function ForgotPasswordForm({
  forgotEmail,
  setForgotEmail,
  loading,
  onSubmit,
  switchToLogin,
}) {
  return (
    <>
      <form className="ig-form" onSubmit={onSubmit}>
        <input
          className="ig-input"
          type="email"
          placeholder="Email address"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          autoComplete="off"
          required
        />

        <button type="submit" className="ig-primary-btn" disabled={loading}>
          {loading ? "Sending…" : "Send login link"}
        </button>
      </form>

      <div className="ig-alt-action">
        <button type="button" className="ig-link-btn" onClick={switchToLogin}>
          Back to login
        </button>
      </div>
    </>
  );
}
