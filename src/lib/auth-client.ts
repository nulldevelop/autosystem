import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_APP_URL as string;

export const authClient = createAuthClient({
  baseURL,
  plugins: [organizationClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
