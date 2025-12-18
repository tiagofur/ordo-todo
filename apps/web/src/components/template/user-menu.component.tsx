import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ordo-todo/ui";
import UserAvatar from "./user-avatar.component";
import useSession from "@/data/hooks/use-session.hook";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export interface UserMenuProps {}

export default function UserMenu(props: UserMenuProps) {
  const t = useTranslations("TopBar");
  const { user, endSession } = useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar alt={user?.$name.initials ?? "US"} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="text-xs">{t("myAccount")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full cursor-pointer">
            {t("profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="w-full cursor-pointer">
            {t("settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={endSession} className="text-red-500">
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

