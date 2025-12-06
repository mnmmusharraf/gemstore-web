import React from "react";

export default function TextInput({ label, value, onChange, ...props }) {
  return (
    <div className="text-input">
      {label && <label className="input-label">{label}</label>}
      <input
        className="input-field"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
    </div>
  );
}
