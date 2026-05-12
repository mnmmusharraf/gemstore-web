import { useState } from "react";

export default function useForgotPasswordForm() {

  const [forgotEmail, setForgotEmail] = useState("");

  return {
    forgotEmail,
    setForgotEmail,
  };
}