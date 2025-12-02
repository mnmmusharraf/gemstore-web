export default function Logo({ mode }) {
  return (
    <div className={mode === "forgot" ? "ig-logo-small" : "ig-logo"}>
      Gemstore
    </div>
  );
}
