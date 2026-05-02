import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const action = String(body.action || "");

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json(
        { message: "Invalid feedback action." },
        { status: 400 }
      );
    }

    const updatedFeedback = await prisma.clientFeedback.update({
      where: {
        id,
      },
      data:
        action === "APPROVE"
          ? {
              status: "APPROVED",
              approvedAt: new Date(),
              rejectedAt: null,
            }
          : {
              status: "REJECTED",
              rejectedAt: new Date(),
              approvedAt: null,
            },
      include: {
        member: {
          include: {
            user: true,
            subscription: true,
          },
        },
      },
    });

    return NextResponse.json({
      message:
        action === "APPROVE"
          ? "Feedback approved successfully."
          : "Feedback rejected successfully.",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("ADMIN_FEEDBACK_PATCH_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update feedback." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingFeedback = await prisma.clientFeedback.findUnique({
      where: {
        id,
      },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { message: "Feedback not found." },
        { status: 404 }
      );
    }

    await prisma.clientFeedback.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Feedback deleted successfully.",
    });
  } catch (error) {
    console.error("ADMIN_FEEDBACK_DELETE_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete feedback." },
      { status: 500 }
    );
  }
}