import { NextResponse } from "next/server";
import { addMonths, format } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { onlinePaymentId } = body;

    if (!onlinePaymentId) {
      return NextResponse.json(
        { message: "Online payment ID is required." },
        { status: 400 }
      );
    }

    const onlinePayment = await prisma.onlinePayment.findUnique({
      where: {
        id: onlinePaymentId,
      },
      include: {
        member: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!onlinePayment) {
      return NextResponse.json(
        { message: "Online payment not found." },
        { status: 404 }
      );
    }

    if (onlinePayment.status === "SUCCESS") {
      return NextResponse.json({
        message: "Payment already completed.",
        onlinePayment,
      });
    }

    const subscription = onlinePayment.member.subscription;

    if (!subscription) {
      return NextResponse.json(
        { message: "Subscription not found." },
        { status: 404 }
      );
    }

    const now = new Date();
    const currentNextDueDate = new Date(subscription.nextDueDate);

    const newNextDueDate =
      currentNextDueDate > now
        ? addMonths(currentNextDueDate, 1)
        : addMonths(now, 1);

    const updatedOnlinePayment = await prisma.onlinePayment.update({
      where: {
        id: onlinePaymentId,
      },
      data: {
        status: "SUCCESS",
        providerPaymentId: `MOCK-HELAPAY-${Date.now()}`,
        callbackData: JSON.stringify({
          message: "Mock HelaPay payment success",
          paidAt: now,
        }),
      },
    });

    const updatedMember = await prisma.member.update({
      where: {
        id: onlinePayment.memberId,
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
            amount: onlinePayment.amount,
            method: "ONLINE",
            status: "PAID",
            paidForMonth: format(now, "MMMM yyyy"),
            paidAt: now,
            dueDate: now,
            note: "Online payment via HelaPay mock flow",
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
      message: "Online payment completed successfully.",
      onlinePayment: updatedOnlinePayment,
      member: updatedMember,
    });
  } catch (error) {
    console.error("ONLINE_PAYMENT_SUCCESS_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to complete online payment." },
      { status: 500 }
    );
  }
}