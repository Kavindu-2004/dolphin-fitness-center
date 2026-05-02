import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { memberId, purpose } = body;

    if (!memberId) {
      return NextResponse.json(
        { message: "Member ID is required." },
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

    const settings = await prisma.systemSetting.findFirst();

    const amount = member.subscription.totalMonthlyFee;
    const currency = settings?.currency || "LKR";

    const onlinePayment = await prisma.onlinePayment.create({
      data: {
        memberId,
        amount,
        currency,
        provider: "HELAPAY",
        providerOrderId: `DFC-${Date.now()}`,
        status: "PENDING",
        purpose: purpose || "MEMBERSHIP_RENEWAL",
        paymentUrl: null,
      },
    });

    return NextResponse.json({
      message: "Online payment created.",
      onlinePayment,
    });
  } catch (error) {
    console.error("ONLINE_PAYMENT_CREATE_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create online payment." },
      { status: 500 }
    );
  }
}