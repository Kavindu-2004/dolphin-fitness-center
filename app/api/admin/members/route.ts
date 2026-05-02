import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();

    await prisma.subscription.updateMany({
      where: {
        status: "ACTIVE",
        nextDueDate: {
          lt: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    const members = await prisma.member.findMany({
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
        payments: {
          orderBy: {
            paidAt: "desc",
          },
          take: 1,
        },
        bodyProfiles: {
          orderBy: {
            measuredAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("ADMIN_MEMBERS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load members." },
      { status: 500 }
    );
  }
}