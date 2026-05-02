import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        member: {
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
        },
        subscription: {
          include: {
            plan: true,
            pendingPlan: true,
            coach: true,
            pendingCoach: true,
          },
        },
      },
      orderBy: {
        paidAt: "desc",
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("ADMIN_PAYMENTS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load payments." },
      { status: 500 }
    );
  }
}