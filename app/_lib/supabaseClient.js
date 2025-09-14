import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import { useMemo, useEffect } from "react";

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
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
};

export function useSupabaseClientWithAuth() {
  const { data: session, status } = useSession();
  
  const supabase = useMemo(() => {
    // Create a new client instance for authenticated requests
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          storageKey: session?.user?.id ? `sb-nextauth-${session.user.id}` : "sb-anonymous",
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    return client;
  }, [session?.user?.id]);

  // Set up authentication when session is available
  useEffect(() => {
    if (session?.user && status === "authenticated") {
      // Create a fake Supabase session using NextAuth data
      const supabaseSession = {
        access_token: session.accessToken || `fake-jwt-${session.user.id}`,
        refresh_token: session.refreshToken || "fake-refresh",
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: "bearer",
        user: {
          id: session.user.id,
          email: session.user.email,
          user_metadata: {
            name: session.user.name,
            avatar_url: session.user.image,
          },
          app_metadata: {},
          aud: "authenticated",
          role: "authenticated",
        },
      };

      // Set the session in Supabase client
      supabase.auth.setSession(supabaseSession);
    } else if (status === "unauthenticated") {
      // Clear session if user is not authenticated
      supabase.auth.signOut();
    }
  }, [session, status, supabase]);

  return { supabase, session, status };
}