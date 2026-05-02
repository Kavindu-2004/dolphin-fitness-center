import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createAdminSessionToken(adminId: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || "change-this-secret-key";
  const createdAt = Date.now().toString();

  const payload = `${adminId}.${createdAt}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Invalid admin email or password." },
        { status: 401 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        { message: "This account does not have admin access." },
        { status: 403 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, admin.password);

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Invalid admin email or password." },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken(admin.id);

    const res = NextResponse.json({
      message: "Admin login successful.",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    res.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return res;
  } catch (error) {
    console.error("ADMIN_LOGIN_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to login admin." },
      { status: 500 }
    );
  }
}