import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { saveGymLogo } from "@/lib/upload";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getOrCreateSettings() {
  const existing = await prisma.systemSetting.findFirst();

  if (existing) {
    return existing;
  }

  return prisma.systemSetting.create({
    data: {
      gymName: "Dolphin Fitness Center",
      logoUrl: null,
      monthlyFee: 3500,
      personalTrainingFee: 15000,
      currency: "LKR",
      reminderDaysBefore: 3,
    },
  });
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
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return admin;
}

async function safeSaveGymLogo(uploadedLogo: File | null, currentLogoUrl: string | null) {
  if (!uploadedLogo || uploadedLogo.size <= 0) {
    return currentLogoUrl;
  }

  try {
    return await saveGymLogo(uploadedLogo);
  } catch (error) {
    console.error("GYM_LOGO_UPLOAD_ERROR:", error);
    return currentLogoUrl;
  }
}

export async function GET() {
  try {
    const settings = await getOrCreateSettings();

    const coaches = await prisma.coach.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    const admin = await getCurrentAdmin();

    return NextResponse.json({
      settings,
      coaches,
      admin,
    });
  } catch (error) {
    console.error("SETTINGS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load settings." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const existing = await getOrCreateSettings();

    const contentType = req.headers.get("content-type") || "";

    let gymName = "";
    let monthlyFee = "";
    let personalTrainingFee = "";
    let currency = "";
    let reminderDaysBefore = "";
    let logoUrl: string | null = existing.logoUrl;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      gymName = String(formData.get("gymName") || "").trim();
      monthlyFee = String(formData.get("monthlyFee") || "").trim();
      personalTrainingFee = String(
        formData.get("personalTrainingFee") || ""
      ).trim();
      currency = String(formData.get("currency") || "").trim();
      reminderDaysBefore = String(
        formData.get("reminderDaysBefore") || ""
      ).trim();

      const uploadedLogo = formData.get("logo");

      if (uploadedLogo instanceof File && uploadedLogo.size > 0) {
        logoUrl = await safeSaveGymLogo(uploadedLogo, existing.logoUrl);
      }
    } else {
      const body = await req.json();

      gymName = String(body.gymName || "").trim();
      monthlyFee = String(body.monthlyFee || "").trim();
      personalTrainingFee = String(body.personalTrainingFee || "").trim();
      currency = String(body.currency || "").trim();
      reminderDaysBefore = String(body.reminderDaysBefore || "").trim();
      logoUrl = body.logoUrl ?? existing.logoUrl;
    }

    const updated = await prisma.systemSetting.update({
      where: {
        id: existing.id,
      },
      data: {
        gymName: gymName || "Dolphin Fitness Center",
        logoUrl,
        monthlyFee: Number(monthlyFee || 3500),
        personalTrainingFee: Number(personalTrainingFee || 15000),
        currency: currency || "LKR",
        reminderDaysBefore: Number(reminderDaysBefore || 3),
      },
    });

    return NextResponse.json({
      message: "Settings updated successfully.",
      settings: updated,
    });
  } catch (error) {
    console.error("SETTINGS_PUT_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update settings." },
      { status: 500 }
    );
  }
}