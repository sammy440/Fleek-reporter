import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storageKey: "sb-browser-anon",
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Server-side Supabase client
export const supabaseServer = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
};

// Cache auth clients by access token so multiple components reuse the same instance
const authClientsByToken = new Map();

function getAuthClientForToken(accessToken) {
  const key = accessToken || "anonymous";
  if (authClientsByToken.has(key)) return authClientsByToken.get(key);

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        storageKey: `sb-nextauth-${key.substring(0, 16)}`,
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    }
  );

  authClientsByToken.set(key, client);
  return client;
}

export function useSupabaseClientWithAuth() {
  const { data: session, status } = useSession();
  const accessToken = session?.user?.accessToken || null;

  const supabase = useMemo(
    () => getAuthClientForToken(accessToken),
    [accessToken]
  );

  return { supabase, session, status };
}
