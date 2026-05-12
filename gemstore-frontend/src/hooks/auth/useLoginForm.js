import { useState } from "react";

export default function useLoginForm() {

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return {
    emailOrUsername,
    setEmailOrUsername,

    password,
    setPassword,

    showPassword,
    setShowPassword,
  };
}