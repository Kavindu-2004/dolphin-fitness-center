import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveCoachImage } from "@/lib/upload";

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";

    let name = "";
    let phone = "";
    let email = "";
    let specialty = "";
    let experience = "";
    let description = "";
    let coachImageFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      name = String(formData.get("name") || "");
      phone = String(formData.get("phone") || "");
      email = String(formData.get("email") || "");
      specialty = String(formData.get("specialty") || "");
      experience = String(formData.get("experience") || "");
      description = String(formData.get("description") || "");

      const uploadedFile = formData.get("image");

      if (uploadedFile instanceof File && uploadedFile.size > 0) {
        coachImageFile = uploadedFile;
      }
    } else {
      const body = await req.json();

      name = body.name || "";
      phone = body.phone || "";
      email = body.email || "";
      specialty = body.specialty || "";
      experience = body.experience || "";
      description = body.description || "";
    }

    if (!name || !phone || !specialty || !experience) {
      return NextResponse.json(
        { message: "Name, phone, specialty, and experience are required." },
        { status: 400 }
      );
    }

    const existingCoach = await prisma.coach.findUnique({
      where: {
        id,
      },
    });

    if (!existingCoach) {
      return NextResponse.json(
        { message: "Coach not found." },
        { status: 404 }
      );
    }

    let image = existingCoach.image;

    if (coachImageFile) {
      image = await saveCoachImage(coachImageFile);
    }

    const updatedCoach = await prisma.coach.update({
      where: {
        id,
      },
      data: {
        name,
        phone,
        email: email || null,
        specialty,
        experience,
        description: description || null,
        image,
      },
    });

    return NextResponse.json({
      message: "Coach updated successfully.",
      coach: updatedCoach,
    });
  } catch (error) {
    console.error("COACH_UPDATE_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update coach." },
      { status: 500 }
    );
  }
}