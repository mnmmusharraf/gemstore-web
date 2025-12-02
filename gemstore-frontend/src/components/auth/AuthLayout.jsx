import Logo from "./Logo";
import Subtitle from "./Subtitle";
import ErrorMessage from "./ErrorMessage";

export default function AuthLayout({ mode, errorMessage, children }) {
  return (
    <div className="ig-root">
      <div className="ig-single-layout">
        <div className="ig-card">

          <Logo mode={mode} />
          <Subtitle mode={mode} />

          {errorMessage && <ErrorMessage text={errorMessage} />}

          {children}
        </div>

        <div className="ig-footer">
          <span>© {new Date().getFullYear()} Gemstore</span>
        </div>
      </div>
    </div>
  );
}
