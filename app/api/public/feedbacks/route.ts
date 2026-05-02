import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const feedbacks = await prisma.clientFeedback.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        approvedAt: "desc",
      },
      take: 6,
    });

    const formattedFeedbacks = feedbacks.map((feedback) => ({
      id: feedback.id,
      rating: feedback.rating,
      message: feedback.message,
      createdAt: feedback.createdAt,
      approvedAt: feedback.approvedAt,
      member: {
        memberNo: feedback.member.memberNo,
        profileImage: feedback.member.profileImage,
        name: feedback.member.user.name,
      },
    }));

    return NextResponse.json(formattedFeedbacks);
  } catch (error) {
    console.error("PUBLIC_FEEDBACKS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load feedbacks." },
      { status: 500 }
    );
  }
}