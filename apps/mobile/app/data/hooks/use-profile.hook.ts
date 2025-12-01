import { useState } from "react";
import { useAuth } from "../../contexts/auth.context";
import { useUpdateProfile } from "../../hooks/api";
import { User } from "@ordo-todo/core";

export default function useProfile() {
  const { user: loggedUser } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  
  const [localName, setLocalName] = useState(loggedUser?.name ?? "");

  async function changeName() {
    try {
      await updateProfileMutation.mutateAsync({ name: localName });
    } catch (error: any) {
      console.error("Failed to update profile:", error);
    }
  }

  return {
    name: localName || loggedUser?.name || "",
    setName: setLocalName,
    changeName,
  };
}
