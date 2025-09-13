// scripts/syncUsersToSupabase.js
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// --- Prisma Client using DIRECT_URL ---
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL, // Direct connection
    },
  },
});

// --- Supabase Client ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncUsers() {
  console.log("Starting user sync to Supabase...");

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    if (!users.length) {
      console.log("No users found in the database.");
      return;
    }

    for (const user of users) {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email,
            name: user.name ?? null,
            avatar_url: user.image ?? null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (error) {
        console.error(`Failed to sync user ${user.email}:`, error);
      } else {
        console.log(`Synced user: ${user.email}`);
      }
    }

    console.log("User sync completed!");
  } catch (error) {
    console.error("Sync script error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncUsers();
