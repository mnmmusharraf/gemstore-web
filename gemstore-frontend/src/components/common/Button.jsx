export default function Button({ text, icon: Icon, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 
      text-white px-4 py-2 rounded-lg transition ${className}`}
    >
      {Icon && <Icon size={18} />}
      {text}
    </button>
  );
}
