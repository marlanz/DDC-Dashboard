import { createAuthClient } from "better-auth/react";
import { getClientAuthBaseUrl } from "@/lib/auth-url";

export const authClient = createAuthClient({
  baseURL: getClientAuthBaseUrl(),
});
