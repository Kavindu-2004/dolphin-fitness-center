import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveProfileImage } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

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

    if (!member) {
      return NextResponse.json(
        { message: "Member profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("MEMBER_PROFILE_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load profile." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();

    const memberId = String(formData.get("memberId") || "");
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const phone = String(formData.get("phone") || "").trim();
    const address = String(formData.get("address") || "").trim();

    if (!memberId || !email || !phone || !address) {
      return NextResponse.json(
        { message: "Email, phone, and address are required." },
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
        { message: "Member not found." },
        { status: 404 }
      );
    }

    const emailOwner = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (emailOwner && emailOwner.id !== member.userId) {
      return NextResponse.json(
        { message: "This email is already used by another account." },
        { status: 400 }
      );
    }

    const uploadedFile = formData.get("profileImage");

    let profileImage: string | null = member.profileImage;

    if (uploadedFile instanceof File && uploadedFile.size > 0) {
      profileImage = await saveProfileImage(uploadedFile);
    }

    const updatedMember = await prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        address,
        profileImage,
        user: {
          update: {
            email,
            phone,
          },
        },
      },
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

    return NextResponse.json({
      message: "Profile updated successfully.",
      member: updatedMember,
    });
  } catch (error) {
    console.error("MEMBER_PROFILE_UPDATE_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update profile." },
      { status: 500 }
    );
  }
}