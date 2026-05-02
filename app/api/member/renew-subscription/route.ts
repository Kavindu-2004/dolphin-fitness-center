import { NextResponse } from "next/server";
import { addMonths, format } from "date-fns";
import { PaymentMethod, SubscriptionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidPaymentMethod(value: string): value is PaymentMethod {
  return (
    value === "CASH" ||
    value === "CARD" ||
    value === "BANK_TRANSFER" ||
    value === "ONLINE"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const memberId = String(body.memberId || "").trim();
    const paymentMethod = String(body.paymentMethod || "CASH");

    if (!memberId) {
      return NextResponse.json(
        { message: "Member is required." },
        { status: 400 }
      );
    }

    if (!isValidPaymentMethod(paymentMethod)) {
      return NextResponse.json(
        { message: "Invalid payment method." },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
      include: {
        user: true,
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
        { message: "This member does not have a subscription." },
        { status: 400 }
      );
    }

    if (member.subscription.status === "CANCELLED") {
      return NextResponse.json(
        { message: "Cancelled subscription cannot be renewed." },
        { status: 400 }
      );
    }

    const today = new Date();
    const subscription = member.subscription;

    const shouldApplyPendingPlan =
      Boolean(subscription.pendingPlanId) &&
      Boolean(subscription.pendingPlan) &&
      (!subscription.pendingPlanEffectiveDate ||
        subscription.pendingPlanEffectiveDate <= today);

    const activePlan = shouldApplyPendingPlan
      ? subscription.pendingPlan
      : subscription.plan;

    if (!activePlan) {
      return NextResponse.json(
        { message: "No valid membership plan found for this subscription." },
        { status: 400 }
      );
    }

    if (!activePlan.isActive) {
      return NextResponse.json(
        { message: "This membership plan is currently inactive." },
        { status: 400 }
      );
    }

    const finalCoachId = shouldApplyPendingPlan
      ? subscription.pendingCoachId
      : subscription.coachId;

    if (activePlan.requiresCoach && !finalCoachId) {
      return NextResponse.json(
        { message: `${activePlan.name} requires a coach before renewal.` },
        { status: 400 }
      );
    }

    const renewalStartDate =
      subscription.nextDueDate && subscription.nextDueDate > today
        ? subscription.nextDueDate
        : today;

    const newNextDueDate = addMonths(renewalStartDate, 1);

    const subscriptionType: SubscriptionType =
      activePlan.isPersonalTraining || activePlan.requiresCoach
        ? "PERSONAL_TRAINING"
        : "NORMAL_MONTHLY";

    const amount = activePlan.monthlyFee;

    const renewedSubscription = await prisma.$transaction(async (tx) => {
      const updated = await tx.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          planId: activePlan.id,
          pendingPlanId: null,

          coachId: finalCoachId || null,
          pendingCoachId: null,

          pendingPlanEffectiveDate: null,
          pendingPlanRequestedAt: null,
          changeNote: shouldApplyPendingPlan
            ? `Pending plan applied during renewal: ${activePlan.name}`
            : subscription.changeNote,

          type: subscriptionType,
          status: "ACTIVE",
          monthlyFee: activePlan.monthlyFee,
          personalTrainingFee:
            activePlan.isPersonalTraining || activePlan.requiresCoach
              ? activePlan.monthlyFee
              : 0,
          totalMonthlyFee: activePlan.monthlyFee,
          lastPaidDate: today,
          nextDueDate: newNextDueDate,
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

      await tx.payment.create({
        data: {
          memberId: member.id,
          subscriptionId: subscription.id,
          amount,
          method: paymentMethod as PaymentMethod,
          status: "PAID",
          paidForMonth: format(renewalStartDate, "MMMM yyyy"),
          paidAt: today,
          dueDate: renewalStartDate,
          note: shouldApplyPendingPlan
            ? `Renewal payment - ${activePlan.name}. Pending subscription change applied.`
            : `Renewal payment - ${activePlan.name}`,
        },
      });

      return updated;
    });

    return NextResponse.json({
      message: shouldApplyPendingPlan
        ? "Payment recorded and pending membership plan applied successfully."
        : "Subscription renewed successfully.",
      subscription: renewedSubscription,
      appliedPendingPlan: shouldApplyPendingPlan,
      amount,
      nextDueDate: renewedSubscription.nextDueDate,
    });
  } catch (error) {
    console.error("MEMBER_RENEW_SUBSCRIPTION_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to renew subscription." },
      { status: 500 }
    );
  }
}