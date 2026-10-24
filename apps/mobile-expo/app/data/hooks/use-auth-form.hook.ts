import { useEffect, useState } from "react";
import { router } from "expo-router";
import useMessages from "./use-messages.hook";
import { useAuth } from "../../contexts/auth.context";

export default function useAuthForm() {
  const { addError } = useMessages();
  const { user, login: loginMutation, register: registerMutation } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user?.email) {
      router.replace("/screens/(internal)/(tabs)" as any);
    }
  }, [user]);

  function toggleMode() {
    setMode(mode === "login" ? "register" : "login");
  }

  async function submit() {
    try {
      if (mode === "login") {
        await loginMutation({ email, password });
      } else {
        await registerMutation({ name, username, email, password });
      }
      clearForm();
    } catch (error: any) {
      addError(error.message || "An error occurred");
    }
  }

  function clearForm() {
    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setMode("login");
  }

  return {
    mode,
    name,
    username,
    email,
    password,
    setName,
    setUsername,
    setEmail,
    setPassword,
    toggleMode,
    submit,
  };
}
