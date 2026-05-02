import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET() {
  try {
    const settings = await getOrCreateSettings();

    return NextResponse.json({
      gymName: settings.gymName,
      logoUrl: settings.logoUrl,
      monthlyFee: settings.monthlyFee,
      personalTrainingFee: settings.personalTrainingFee,
      personalTrainingTotal:
        settings.monthlyFee + settings.personalTrainingFee,
      currency: settings.currency,
      reminderDaysBefore: settings.reminderDaysBefore,
    });
  } catch (error) {
    console.error("PUBLIC_SETTINGS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load settings." },
      { status: 500 }
    );
  }
}