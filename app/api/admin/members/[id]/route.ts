import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const now = new Date();

    const memberBeforeUpdate = await prisma.member.findUnique({
      where: { id },
      include: {
        subscription: true,
      },
    });

    if (!memberBeforeUpdate) {
      return NextResponse.json(
        { message: "Member not found." },
        { status: 404 }
      );
    }

    if (
      memberBeforeUpdate.subscription &&
      memberBeforeUpdate.subscription.status === "ACTIVE" &&
      memberBeforeUpdate.subscription.nextDueDate < now
    ) {
      await prisma.subscription.update({
        where: {
          id: memberBeforeUpdate.subscription.id,
        },
        data: {
          status: "EXPIRED",
        },
      });
    }

    const member = await prisma.member.findUnique({
      where: { id },
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
        },
        bodyProfiles: {
          orderBy: {
            measuredAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("ADMIN_MEMBER_DETAILS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load member details." },
      { status: 500 }
    );
  }
}