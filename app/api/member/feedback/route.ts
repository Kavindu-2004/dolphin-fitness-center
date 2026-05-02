import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const memberId = String(body.memberId || "");
    const rating = Number(body.rating || 0);
    const message = String(body.message || "").trim();

    if (!memberId) {
      return NextResponse.json(
        { message: "Please login before submitting feedback." },
        { status: 401 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Please select a rating between 1 and 5." },
        { status: 400 }
      );
    }

    if (!message || message.length < 10) {
      return NextResponse.json(
        { message: "Feedback message must be at least 10 characters." },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
      include: {
        user: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { message: "Member account not found." },
        { status: 404 }
      );
    }

    const feedback = await prisma.clientFeedback.create({
      data: {
        memberId,
        rating,
        message,
        status: "PENDING",
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      message:
        "Feedback submitted successfully. It will appear on the website after admin approval.",
      feedback,
    });
  } catch (error) {
    console.error("MEMBER_FEEDBACK_POST_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to submit feedback." },
      { status: 500 }
    );
  }
}