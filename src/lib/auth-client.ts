import { adminClient, organizationClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const getBaseUrl = () => {
	if (process.env.NEXT_PUBLIC_URL) {
		return process.env.NEXT_PUBLIC_URL;
	}
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [
    usernameClient(),
    adminClient(),
    organizationClient(),
  ],
});
