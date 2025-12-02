export default function PasswordInput({
  value,
  setValue,
  showPassword,
  setShowPassword,
  placeholder = "Password",
}) {
  return (
    <div className="ig-password-wrapper">
      <input
        className="ig-input ig-password-input"
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
        required
      />

      <button
        type="button"
        className="ig-password-toggle"
        onClick={() => setShowPassword((v) => !v)}
      >
        {showPassword ? "Hide" : "Show"}
      </button>
    </div>
  );
}
