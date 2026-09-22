import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getAuthSession } from "./session.server";

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const NOT_CONFIGURED_MESSAGE =
  "Login is not configured on this deployment. Set ADMIN_USERNAME, ADMIN_PASSWORD and " +
  "SESSION_SECRET in the environment variables and redeploy.";

// Credentials come from Vercel env vars (ADMIN_USERNAME / ADMIN_PASSWORD).
// There is deliberately no hardcoded fallback — without both set (and a
// valid SESSION_SECRET, checked via getAuthSession), login fails closed
// rather than accepting a default password that would sit in the repo.
export const loginFn = createServerFn({ method: "POST" })
  .validator(credentialsSchema)
  .handler(async ({ data }) => {
    const expectedUsername = process.env["ADMIN_USERNAME"];
    const expectedPassword = process.env["ADMIN_PASSWORD"];

    if (!expectedUsername || !expectedPassword) {
      return { success: false as const, error: NOT_CONFIGURED_MESSAGE };
    }

    const session = await getAuthSession();
    if (!session) {
      return { success: false as const, error: NOT_CONFIGURED_MESSAGE };
    }

    if (data.username !== expectedUsername || data.password !== expectedPassword) {
      return { success: false as const, error: "Invalid username or password" };
    }

    await session.update({ isAdmin: true });
    return { success: true as const };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAuthSession();
  await session?.clear();
  return { success: true as const };
});

export const getAuthStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAuthSession();
  return { isAuthenticated: session?.data.isAdmin === true };
});
