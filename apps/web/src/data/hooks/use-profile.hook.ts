import { useEffect, useState } from "react";
import useMessages from "./use-messages.hook";
import useSession from "./use-session.hook";
import { User } from "@ordo-todo/core";
import { useCurrentUser, useUpdateProfile } from "@/lib/api-hooks";

export default function useProfile() {
  const { addError, addSuccess } = useMessages();

  const { user: loggedUser } = useSession();
  const [user, setUser] = useState<User | null>(null);

  const { data: fetchedUser } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    if (fetchedUser) {
      // Convert null values to undefined for User entity compatibility
      setUser(new User({
        id: fetchedUser.id,
        username: fetchedUser.username,
        name: fetchedUser.name ?? undefined,
        email: fetchedUser.email,
      }));
    }
  }, [fetchedUser]);

  async function changeName() {
    try {
      if (!user) return;
      await updateProfile.mutateAsync({ name: user.name });
      addSuccess("Nome alterado com sucesso!");
    } catch (error: any) {
      addError(error.message);
    }
  }

  return {
    name: user?.name ?? "",
    setName: (name: string) => {
      setUser((u) => (u ? User.draft({ ...u.data, name }) : u));
    },
    changeName,
  };
}
