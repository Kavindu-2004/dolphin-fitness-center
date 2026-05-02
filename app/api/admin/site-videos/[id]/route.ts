import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveSiteVideo } from "@/lib/upload";

export const runtime = "nodejs";

function toBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true";
  }

  return Boolean(value);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingVideo = await prisma.siteVideo.findUnique({
      where: {
        id,
      },
    });

    if (!existingVideo) {
      return NextResponse.json(
        { message: "Site video not found." },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const isActive = toBoolean(formData.get("isActive"));
    const priority = Number(formData.get("priority") || 1);

    const uploadedFile = formData.get("video");
    const videoFile =
      uploadedFile instanceof File && uploadedFile.size > 0
        ? uploadedFile
        : null;

    if (!title) {
      return NextResponse.json(
        { message: "Video title is required." },
        { status: 400 }
      );
    }

    if (Number.isNaN(priority) || priority < 1 || priority > 5) {
      return NextResponse.json(
        { message: "Priority must be between 1 and 5." },
        { status: 400 }
      );
    }

    const uploadedVideoUrl = await saveSiteVideo(videoFile);

    const updatedVideo = await prisma.siteVideo.update({
      where: {
        id,
      },
      data: {
        title,
        description: description || null,
        videoUrl: uploadedVideoUrl || existingVideo.videoUrl,
        isActive,
        priority,
      },
    });

    return NextResponse.json({
      message: "Site video updated successfully.",
      video: updatedVideo,
    });
  } catch (error) {
    console.error("ADMIN_SITE_VIDEO_PUT_ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update site video.",
      },
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

    const existingVideo = await prisma.siteVideo.findUnique({
      where: {
        id,
      },
    });

    if (!existingVideo) {
      return NextResponse.json(
        { message: "Site video not found." },
        { status: 404 }
      );
    }

    await prisma.siteVideo.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Site video deleted successfully.",
    });
  } catch (error) {
    console.error("ADMIN_SITE_VIDEO_DELETE_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete site video." },
      { status: 500 }
    );
  }
}