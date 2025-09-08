import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { supabaseServer } from "@/app/_lib/supabaseClient";
import bcryptjs from "bcryptjs";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create user in Prisma/database
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        hashedPassword,
        emailVerified: null, // Will be handled by NextAuth if needed
      },
    });

    // Create profile in Supabase
    try {
      const sb = supabaseServer();
      const { error: supabaseError } = await sb.from("profiles").insert({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: null,
      });

      if (supabaseError) {
        console.error("Supabase profile creation error:", supabaseError);
        // Don't fail the registration if Supabase fails
      }
    } catch (supabaseError) {
      console.error("Supabase connection error:", supabaseError);
    }

    // Return success (don't include sensitive data)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
