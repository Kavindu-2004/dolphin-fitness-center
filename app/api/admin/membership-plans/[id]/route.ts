import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const existingPlan = await prisma.membershipPlan.findUnique({
      where: {
        id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { message: "Membership plan not found." },
        { status: 404 }
      );
    }

    const slug = createSlug(name);

    const slugOwner = await prisma.membershipPlan.findUnique({
      where: {
        slug,
      },
    });

    if (slugOwner && slugOwner.id !== id) {
      return NextResponse.json(
        { message: "Another membership plan already uses this name." },
        { status: 409 }
      );
    }

    const updatedPlan = await prisma.membershipPlan.update({
      where: {
        id,
      },
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
      message: "Membership plan updated successfully.",
      plan: updatedPlan,
    });
  } catch (error) {
    console.error("ADMIN_MEMBERSHIP_PLAN_PUT_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update membership plan." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingPlan = await prisma.membershipPlan.findUnique({
      where: {
        id,
      },
      include: {
        subscriptions: true,
        pendingSubscriptions: true,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { message: "Membership plan not found." },
        { status: 404 }
      );
    }

    const hasSubscriptions =
      existingPlan.subscriptions.length > 0 ||
      existingPlan.pendingSubscriptions.length > 0;

    if (hasSubscriptions) {
      return NextResponse.json(
        {
          message:
            "This plan is already used by members. Deactivate it instead of deleting.",
        },
        { status: 400 }
      );
    }

    await prisma.membershipPlan.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Membership plan deleted successfully.",
    });
  } catch (error) {
    console.error("ADMIN_MEMBERSHIP_PLAN_DELETE_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete membership plan." },
      { status: 500 }
    );
  }
}