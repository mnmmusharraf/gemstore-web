export default function Subtitle({ mode }) {
  let text = "";

  if (mode === "login") {
    text = "Sign in to explore and trade gemstones.";
  } else if (mode === "register") {
    text = "Create an account to start selling and buying gems.";
  } else if (mode === "forgot") {
    text = "Trouble logging in? Enter your email to get a login link.";
  }

  return <div className="ig-subtitle">{text}</div>;
}
