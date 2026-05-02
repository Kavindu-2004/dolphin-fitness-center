import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const memberId = String(body.memberId || "").trim();
    const planId = String(body.planId || "").trim();
    const coachId = String(body.coachId || "").trim();

    if (!memberId || !planId) {
      return NextResponse.json(
        { message: "Member and new membership plan are required." },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
      include: {
        subscription: {
          include: {
            plan: true,
            pendingPlan: true,
            coach: true,
            pendingCoach: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { message: "Member not found." },
        { status: 404 }
      );
    }

    if (!member.subscription) {
      return NextResponse.json(
        { message: "This member does not have an active subscription." },
        { status: 400 }
      );
    }

    if (member.subscription.status === "CANCELLED") {
      return NextResponse.json(
        { message: "Cancelled subscription cannot be changed." },
        { status: 400 }
      );
    }

    const newPlan = await prisma.membershipPlan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!newPlan || !newPlan.isActive) {
      return NextResponse.json(
        { message: "Selected membership plan is not available." },
        { status: 400 }
      );
    }

    if (member.subscription.planId === newPlan.id) {
      return NextResponse.json(
        { message: "This member is already on this membership plan." },
        { status: 400 }
      );
    }

    let validCoachId: string | null = null;

    if (newPlan.requiresCoach) {
      if (!coachId) {
        return NextResponse.json(
          { message: `${newPlan.name} requires coach selection.` },
          { status: 400 }
        );
      }

      const coach = await prisma.coach.findUnique({
        where: {
          id: coachId,
        },
      });

      if (!coach) {
        return NextResponse.json(
          { message: "Selected coach was not found." },
          { status: 400 }
        );
      }

      validCoachId = coach.id;
    }

    const updatedSubscription = await prisma.subscription.update({
      where: {
        id: member.subscription.id,
      },
      data: {
        pendingPlanId: newPlan.id,
        pendingCoachId: validCoachId,
        pendingPlanEffectiveDate: member.subscription.nextDueDate,
        pendingPlanRequestedAt: new Date(),
        changeNote: `Plan change requested from ${
          member.subscription.plan?.name || "current plan"
        } to ${newPlan.name}. This will apply from the next billing cycle.`,
      },
      include: {
        plan: true,
        pendingPlan: true,
        coach: true,
        pendingCoach: true,
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      message:
        "Subscription change saved. New plan will apply from the next billing cycle.",
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("MEMBER_CHANGE_SUBSCRIPTION_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to request subscription change." },
      { status: 500 }
    );
  }
}