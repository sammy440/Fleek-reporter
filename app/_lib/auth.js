

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/_lib/prisma";
import { supabaseServer } from "@/app/_lib/supabaseServer";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account", // Changed from "consent" to avoid repeated consent
          access_type: "offline",
          response_type: "code",
        },
      },
      // Explicitly set the profile mapping
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.hashedPassword) {
            console.log("User not found or no password set");
            return null;
          }

          const isPasswordValid = await bcryptjs.compare(
            credentials.password,
            user.hashedPassword
          );

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Credentials authorization error:", error);
          return null;
        }
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      console.log("Creating user profile:", user.email);
      try {
        const { error } = await supabaseServer.from("profiles").upsert(
          {
            id: user.id,
            name: user.name ?? null,
            email: user.email ?? null,
            avatar_url: user.image ?? null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

        if (error) {
          console.error("Supabase profile creation error:", error);
        } else {
          console.log("User profile created successfully:", user.email);
        }
      } catch (error) {
        console.error("Error in createUser event:", error);
      }
    },
    async signIn({ user, account, profile }) {
      console.log("Sign in event:", {
        user: user.email,
        provider: account?.provider,
        accountId: account?.providerAccountId,
      });

      // Update Supabase profile on each sign in (for OAuth providers)
      if (account?.provider === "google") {
        try {
          const { error } = await supabaseServer.from("profiles").upsert(
            {
              id: user.id,
              name: user.name ?? null,
              email: user.email ?? null,
              avatar_url: user.image ?? null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

          if (error) {
            console.error("Supabase profile update error:", error);
          }
        } catch (error) {
          console.error("Error updating profile on sign in:", error);
        }
      }

      return true;
    },
  },
  callbacks: {
    async signIn({ account, user, profile }) {
      console.log("SignIn callback triggered:", {
        provider: account?.provider,
        userEmail: user?.email,
        profileEmail: profile?.email,
        error: account?.error,
      });

      try {
        // Check if this is Google OAuth
        if (account?.provider === "google") {
          // Validate required Google profile data
          if (!profile?.email || !profile?.sub) {
            console.error("Missing required Google profile data");
            return false;
          }

          console.log("Google OAuth sign-in approved");
          return true;
        }

        // Allow credentials provider
        if (account?.provider === "credentials") {
          console.log("Credentials sign-in approved");
          return true;
        }

        console.log("Unknown provider, allowing:", account?.provider);
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async jwt({ token, user, account, trigger }) {
      console.log("JWT callback:", {
        trigger,
        provider: account?.provider,
        userEmail: user?.email,
      });

      try {
        // Persist the user ID to the token right after signin
        if (user) {
          token.sub = user.id;
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;
        }

        // Generate Supabase compatible JWT
        if (process.env.SUPABASE_JWT_SECRET) {
          token.accessToken = jwt.sign(
            {
              sub: token.sub,
              email: token.email,
              role: "authenticated",
              aud: "authenticated",
            },
            process.env.SUPABASE_JWT_SECRET,
            {
              algorithm: "HS256",
              expiresIn: "1h",
            }
          );
        }

        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      console.log("Session callback:", {
        sessionEmail: session?.user?.email,
        tokenSub: token?.sub,
      });

      try {
        // Send properties to the client
        if (session?.user && token?.sub) {
          session.user.id = token.sub;
          session.user.accessToken = token.accessToken;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });

      try {
        // Handle various redirect scenarios
        if (url.startsWith("/")) {
          console.log("Redirecting to relative path:", `${baseUrl}${url}`);
          return `${baseUrl}${url}`;
        }

        if (new URL(url).origin === baseUrl) {
          console.log("Redirecting to same origin:", url);
          return url;
        }

        console.log("Default redirect to /account");
        return `${baseUrl}/account`;
      } catch (error) {
        console.error("Redirect callback error:", error);
        return `${baseUrl}/account`;
      }
    },
  },
  pages: {
    signIn: "/",
    error: "/api/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", code, metadata);
    },
    warn(code, metadata) {
      console.warn("NextAuth Warning:", code, metadata);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log("NextAuth Debug:", code, metadata);
      }
    },
  },
};

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
