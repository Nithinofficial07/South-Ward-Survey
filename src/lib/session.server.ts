// Aliased on import: this is TanStack Start's session helper, not a React hook,
// but its `use*` name otherwise trips eslint-plugin-react-hooks in this server-only file.
import { useSession as createSessionManager } from "@tanstack/react-start/server";

export type AuthSessionData = {
  isAdmin?: boolean;
};

// Session cookies are sealed (encrypted + signed) with this password, so it
// must never be checked in. Set SESSION_SECRET in Vercel's project env vars
// (Settings -> Environment Variables) to a random string of 32+ characters.
// Without it, sessions still work locally but won't survive a redeploy and
// aren't safe for production.
const FALLBACK_DEV_SECRET = "insecure-local-dev-secret-set-SESSION_SECRET-in-vercel-env-vars";

function getSessionPassword(): string {
  const secret = process.env["SESSION_SECRET"];
  if (secret && secret.length >= 32) return secret;
  if (process.env["NODE_ENV"] === "production") {
    console.warn(
      "SESSION_SECRET is not set (or is shorter than 32 characters) — using an insecure " +
        "fallback. Set SESSION_SECRET in the Vercel project's environment variables.",
    );
  }
  return FALLBACK_DEV_SECRET;
}

export function getAuthSession() {
  return createSessionManager<AuthSessionData>({
    password: getSessionPassword(),
    name: "sws_session",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    cookie: {
      sameSite: "lax",
      secure: process.env["NODE_ENV"] === "production",
    },
  });
}
