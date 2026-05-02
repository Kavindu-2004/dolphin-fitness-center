import { NextResponse } from "next/server";
import { addMonths, format } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { memberId, paymentMethod } = body;

    if (!memberId || !paymentMethod) {
      return NextResponse.json(
        { message: "Member ID and payment method are required." },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
      include: {
        subscription: true,
      },
    });

    if (!member || !member.subscription) {
      return NextResponse.json(
        { message: "Member or subscription not found." },
        { status: 404 }
      );
    }

    const now = new Date();

    const currentNextDueDate = new Date(member.subscription.nextDueDate);
    const newNextDueDate =
      currentNextDueDate > now ? addMonths(currentNextDueDate, 1) : addMonths(now, 1);

    const updatedMember = await prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        subscription: {
          update: {
            status: "ACTIVE",
            lastPaidDate: now,
            nextDueDate: newNextDueDate,
          },
        },
        payments: {
          create: {
            amount: member.subscription.totalMonthlyFee,
            method: paymentMethod,
            status: "PAID",
            paidForMonth: format(now, "MMMM yyyy"),
            paidAt: now,
            dueDate: now,
            note: "Monthly membership renewal payment",
          },
        },
      },
      include: {
        user: true,
        subscription: {
          include: {
            coach: true,
          },
        },
        payments: {
          orderBy: {
            paidAt: "desc",
          },
        },
        bodyProfiles: {
          orderBy: {
            measuredAt: "desc",
          },
        },
      },
    });

    return NextResponse.json({
      message: "Monthly payment recorded successfully.",
      member: updatedMember,
    });
  } catch (error) {
    console.error("RECORD_PAYMENT_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to record monthly payment." },
      { status: 500 }
    );
  }
}