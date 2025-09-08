// Create app/api/test-signin/route.js for testing

import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import bcryptjs from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log("🧪 Test sign-in attempt for:", email);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log("❌ User not found");
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    console.log("✅ User found:", { id: user.id, email: user.email });

    if (!user.hashedPassword) {
      console.log("❌ No password hash found");
      return NextResponse.json(
        {
          success: false,
          error: "No password set for this user",
        },
        { status: 400 }
      );
    }

    // Check password
    const isValid = await bcryptjs.compare(password, user.hashedPassword);
    console.log("🔑 Password check result:", isValid);

    return NextResponse.json({
      success: isValid,
      message: isValid ? "Credentials valid" : "Invalid password",
      user: isValid
        ? { id: user.id, email: user.email, name: user.name }
        : null,
    });
  } catch (error) {
    console.error("🧪 Test sign-in error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
