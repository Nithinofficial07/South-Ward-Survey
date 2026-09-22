// Aliased on import: this is TanStack Start's session helper, not a React hook,
// but its `use*` name otherwise trips eslint-plugin-react-hooks in this server-only file.
import { useSession as createSessionManager } from "@tanstack/react-start/server";

export type AuthSessionData = {
  isAdmin?: boolean;
};

// Session cookies are sealed (encrypted + signed) with this password. There is
// deliberately no fallback: without a real SESSION_SECRET, someone who reads
// this source could seal their own "isAdmin: true" cookie and skip the login
// entirely. Set SESSION_SECRET in Vercel (Settings -> Environment Variables)
// to a random string of 32+ characters before login will work anywhere.
function getSessionPassword(): string | undefined {
  const secret = process.env["SESSION_SECRET"];
  return secret && secret.length >= 32 ? secret : undefined;
}

// Returns undefined when SESSION_SECRET isn't configured, so callers fail
// closed (treat the visitor as unauthenticated) instead of falling back to
// an insecure default.
export async function getAuthSession() {
  const password = getSessionPassword();
  if (!password) return undefined;

  return createSessionManager<AuthSessionData>({
    password,
    name: "sws_session",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    cookie: {
      sameSite: "lax",
      secure: process.env["NODE_ENV"] === "production",
    },
  });
}
