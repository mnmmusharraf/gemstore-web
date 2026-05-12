import { useState } from "react";

export default function useRegisterForm() {

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [emailForRegister, setEmailForRegister] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return {
    displayName,
    setDisplayName,

    username,
    setUsername,

    emailForRegister,
    setEmailForRegister,

    password,
    setPassword,

    showPassword,
    setShowPassword,
  };
}