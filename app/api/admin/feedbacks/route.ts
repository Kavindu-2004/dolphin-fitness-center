import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const feedbacks = await prisma.clientFeedback.findMany({
      include: {
        member: {
          include: {
            user: true,
            subscription: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("ADMIN_FEEDBACKS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load feedbacks." },
      { status: 500 }
    );
  }
}