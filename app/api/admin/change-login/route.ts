import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeCompare(valueA: string, valueB: string) {
  const bufferA = Buffer.from(valueA);
  const bufferB = Buffer.from(valueB);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!session) {
    return null;
  }

  const adminId = session.split(".")[0];

  if (!adminId) {
    return null;
  }

  const admin = await prisma.user.findFirst({
    where: {
      id: adminId,
      role: "ADMIN",
    },
  });

  return admin;
}

export async function PUT(req: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin session not found. Please login again." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const newEmail = String(body.newEmail || "").trim().toLowerCase();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!newEmail || !currentPassword) {
      return NextResponse.json(
        { message: "New email and current password are required." },
        { status: 400 }
      );
    }

    const currentPasswordMatches = safeCompare(
      currentPassword,
      admin.password
    );

    if (!currentPasswordMatches) {
      return NextResponse.json(
        { message: "Current password is incorrect." },
        { status: 401 }
      );
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { message: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "New password and confirm password do not match." },
        { status: 400 }
      );
    }

    const emailOwner = await prisma.user.findUnique({
      where: {
        email: newEmail,
      },
    });

    if (emailOwner && emailOwner.id !== admin.id) {
      return NextResponse.json(
        { message: "This email is already used by another account." },
        { status: 409 }
      );
    }

    const updatedAdmin = await prisma.user.update({
      where: {
        id: admin.id,
      },
      data: {
        email: newEmail,
        password: newPassword || admin.password,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Admin login details updated successfully.",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("ADMIN_CHANGE_LOGIN_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update admin login details." },
      { status: 500 }
    );
  }
}