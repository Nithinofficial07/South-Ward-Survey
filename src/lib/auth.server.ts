import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getAuthSession } from "./session.server";

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Credentials come from Vercel env vars (ADMIN_USERNAME / ADMIN_PASSWORD).
// Falls back to admin / admin@123 when unset, so the site still gates
// locally — set both in the Vercel project settings for production.
export const loginFn = createServerFn({ method: "POST" })
  .validator(credentialsSchema)
  .handler(async ({ data }) => {
    const expectedUsername = process.env["ADMIN_USERNAME"] ?? "admin";
    const expectedPassword = process.env["ADMIN_PASSWORD"] ?? "admin@123";

    if (data.username !== expectedUsername || data.password !== expectedPassword) {
      return { success: false as const, error: "Invalid username or password" };
    }

    const session = await getAuthSession();
    await session.update({ isAdmin: true });
    return { success: true as const };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAuthSession();
  await session.clear();
  return { success: true as const };
});

export const getAuthStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAuthSession();
  return { isAuthenticated: session.data.isAdmin === true };
});
