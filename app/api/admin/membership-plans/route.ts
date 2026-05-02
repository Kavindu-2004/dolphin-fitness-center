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

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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
      orderBy: [
        {
          priority: "desc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("ADMIN_MEMBERSHIP_PLANS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load membership plans." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const monthlyFee = Number(body.monthlyFee || 0);
    const features = String(body.features || "").trim();
    const isActive = Boolean(body.isActive);
    const isPersonalTraining = Boolean(body.isPersonalTraining);
    const requiresCoach = Boolean(body.requiresCoach);
    const priority = Number(body.priority || 1);

    if (!name) {
      return NextResponse.json(
        { message: "Plan name is required." },
        { status: 400 }
      );
    }

    if (Number.isNaN(monthlyFee) || monthlyFee <= 0) {
      return NextResponse.json(
        { message: "Monthly fee must be greater than 0." },
        { status: 400 }
      );
    }

    if (Number.isNaN(priority) || priority < 1 || priority > 10) {
      return NextResponse.json(
        { message: "Priority must be between 1 and 10." },
        { status: 400 }
      );
    }

    const slug = createSlug(name);

    const existingPlan = await prisma.membershipPlan.findUnique({
      where: {
        slug,
      },
    });

    if (existingPlan) {
      return NextResponse.json(
        { message: "A membership plan with this name already exists." },
        { status: 409 }
      );
    }

    const plan = await prisma.membershipPlan.create({
      data: {
        name,
        slug,
        description: description || null,
        monthlyFee,
        features: features || null,
        isActive,
        isPersonalTraining,
        requiresCoach,
        priority,
      },
    });

    return NextResponse.json({
      message: "Membership plan created successfully.",
      plan,
    });
  } catch (error) {
    console.error("ADMIN_MEMBERSHIP_PLANS_POST_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create membership plan." },
      { status: 500 }
    );
  }
}