import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const defaultPlans = [
  {
    name: "Silver Membership",
    slug: "silver-membership",
    description: "Basic monthly gym membership for regular gym access.",
    monthlyFee: 3500,
    features:
      "Monthly gym access\nPayment reminder support\nMember profile access\nBody profile tracking",
    isActive: true,
    isPersonalTraining: false,
    requiresCoach: false,
    priority: 1,
  },
  {
    name: "Gold Membership",
    slug: "gold-membership",
    description: "Improved membership package for committed gym members.",
    monthlyFee: 5000,
    features:
      "Everything in Silver\nPriority member support\nProgress tracking\nWorkout guidance",
    isActive: true,
    isPersonalTraining: false,
    requiresCoach: false,
    priority: 2,
  },
  {
    name: "Platinum Membership",
    slug: "platinum-membership",
    description: "Advanced membership package for serious training goals.",
    monthlyFee: 7500,
    features:
      "Everything in Gold\nAdvanced body profile tracking\nTraining progress support\nPremium gym access",
    isActive: true,
    isPersonalTraining: false,
    requiresCoach: false,
    priority: 3,
  },
  {
    name: "Diamond Membership",
    slug: "diamond-membership",
    description:
      "Personal training membership with coach selection and advanced progress support.",
    monthlyFee: 15000,
    features:
      "Everything in Platinum\nPersonal training included\nChoose your coach\nAdvanced progress support",
    isActive: true,
    isPersonalTraining: true,
    requiresCoach: true,
    priority: 4,
  },
];

async function seedDefaultPlansIfEmpty() {
  const count = await prisma.membershipPlan.count();

  if (count > 0) {
    return;
  }

  await prisma.membershipPlan.createMany({
    data: defaultPlans,
  });
}

export async function GET() {
  try {
    await seedDefaultPlansIfEmpty();

    const plans = await prisma.membershipPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          priority: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("PUBLIC_MEMBERSHIP_PLANS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load membership plans." },
      { status: 500 }
    );
  }
}