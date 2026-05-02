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

export async function GET() {
  try {
    const videos = await prisma.siteVideo.findMany({
      orderBy: [
        {
          priority: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("ADMIN_SITE_VIDEOS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load site videos." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
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

    if (!videoFile) {
      return NextResponse.json(
        { message: "Please upload a video file." },
        { status: 400 }
      );
    }

    if (Number.isNaN(priority) || priority < 1 || priority > 5) {
      return NextResponse.json(
        { message: "Priority must be between 1 and 5." },
        { status: 400 }
      );
    }

    const videoUrl = await saveSiteVideo(videoFile);

    if (!videoUrl) {
      return NextResponse.json(
        { message: "Video upload failed." },
        { status: 400 }
      );
    }

    const video = await prisma.siteVideo.create({
      data: {
        title,
        description: description || null,
        videoUrl,
        isActive,
        priority,
      },
    });

    return NextResponse.json({
      message: "Site video uploaded successfully.",
      video,
    });
  } catch (error) {
    console.error("ADMIN_SITE_VIDEOS_POST_ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload site video.",
      },
      { status: 500 }
    );
  }
}