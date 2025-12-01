import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@ordo-todo/web/src/server/api/root";

export const api = createTRPCReact<AppRouter>();
