const LOCAL_DEV_ORIGIN = "http://localhost:3000";

function parseOriginList(value?: string): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/** Server-side Better Auth base URL. */
export function getServerAuthBaseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL?.trim() ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : LOCAL_DEV_ORIGIN)
  );
}

/** Client-side Better Auth base URL (must be NEXT_PUBLIC_*). */
export function getClientAuthBaseUrl(): string {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim() || window.location.origin
    );
  }

  return (
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim() || getServerAuthBaseUrl()
  );
}

/** Origins allowed for Better Auth CSRF / sign-out requests. */
export function getTrustedOrigins(): string[] {
  const origins = new Set<string>([
    getServerAuthBaseUrl(),
    ...parseOriginList(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
    ...parseOriginList(process.env.NEXT_PUBLIC_BETTER_AUTH_URL),
    LOCAL_DEV_ORIGIN,
  ]);

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }

  return [...origins];
}
