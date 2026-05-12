import { Outlet, useLocation } from "react-router-dom";
import Logo from "./Logo";
import Subtitle from "./Subtitle";
import ErrorMessage from "./ErrorMessage";

export default function AuthLayout({ errorMessage }) {
  const location = useLocation();

  // Figure out the mode based on the current URL
  let mode = "login";
  if (location.pathname === "/register") mode = "register";
  if (location.pathname === "/forgot-password") mode = "forgot";

  return (
    <div className="ig-root">
      <div className="ig-single-layout">
        <div className="ig-card">

          <Logo mode={mode} />
          <Subtitle mode={mode} />

          {errorMessage && <ErrorMessage text={errorMessage} />}

          {/* <Outlet /> acts as a placeholder. React Router injects the correct form here */}
          <Outlet />
          
        </div>

        <div className="ig-footer">
          <span>© {new Date().getFullYear()} Gemstore</span>
        </div>
      </div>
    </div>
  );
}