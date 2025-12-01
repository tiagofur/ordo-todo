import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSession from "./use-session.hook";
import useMessages from "./use-messages.hook";
import { useLogin, useRegister } from "@/lib/api-hooks";

export default function useAuthForm() {
  const { addError } = useMessages();
  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const { user, startSession } = useSession();

  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (user?.email) {
      const destination = params.get("destination") as string;
      router.push(destination ? destination : "/");
    }
  }, [user, router, params]);

  function toggleMode() {
    setMode(mode === "login" ? "register" : "login");
  }

  async function submit() {
    try {
      if (mode === "login") {
        await login();
      } else {
        await registerUser();
        await login();
      }
      clearForm();
    } catch (error: any) {
      addError(error.message);
    }
  }

  async function login() {
    const response = await loginMutation.mutateAsync({ email, password });
    // Assuming response contains token or user object with token
    // Adjust based on actual response structure
    startSession();
  }

  async function registerUser() {
    await registerMutation.mutateAsync({ name, email, password });
  }

  function clearForm() {
    setName("");
    setEmail("");
    setPassword("");
    setMode("login");
  }

  return {
    mode,
    name,
    email,
    password,
    setName,
    setEmail,
    setPassword,
    toggleMode,
    submit,
  };
}
