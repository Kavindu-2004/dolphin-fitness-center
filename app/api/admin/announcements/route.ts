import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveAnnouncementImage } from "@/lib/upload";

export const runtime = "nodejs";

type AnnouncementType = "NOTICE" | "EVENT" | "CLOSING_DAY" | "IMPORTANT";

function isValidAnnouncementType(type: string): type is AnnouncementType {
  return (
    type === "NOTICE" ||
    type === "EVENT" ||
    type === "CLOSING_DAY" ||
    type === "IMPORTANT"
  );
}

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
    const announcements = await prisma.announcement.findMany({
      orderBy: [
        {
          priority: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("ADMIN_ANNOUNCEMENTS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load announcements." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let title = "";
    let message = "";
    let type = "NOTICE";
    let eventDateValue = "";
    let isActive = true;
    let priority = 1;
    let imageFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      title = String(formData.get("title") || "").trim();
      message = String(formData.get("message") || "").trim();
      type = String(formData.get("type") || "NOTICE");
      eventDateValue = String(formData.get("eventDate") || "");
      isActive = toBoolean(formData.get("isActive"));
      priority = Number(formData.get("priority") || 1);

      const uploadedFile = formData.get("image");

      if (uploadedFile instanceof File && uploadedFile.size > 0) {
        imageFile = uploadedFile;
      }
    } else {
      const body = await req.json();

      title = String(body.title || "").trim();
      message = String(body.message || "").trim();
      type = String(body.type || "NOTICE");
      eventDateValue = String(body.eventDate || "");
      isActive = toBoolean(body.isActive);
      priority = Number(body.priority || 1);
    }

    const eventDate = eventDateValue ? new Date(eventDateValue) : null;

    if (!title || !message) {
      return NextResponse.json(
        { message: "Title and message are required." },
        { status: 400 }
      );
    }

    if (!isValidAnnouncementType(type)) {
      return NextResponse.json(
        { message: "Invalid announcement type." },
        { status: 400 }
      );
    }

    if (Number.isNaN(priority) || priority < 1 || priority > 5) {
      return NextResponse.json(
        { message: "Priority must be between 1 and 5." },
        { status: 400 }
      );
    }

    const imageUrl = await saveAnnouncementImage(imageFile);

    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        type,
        imageUrl,
        eventDate,
        isActive,
        priority,
      },
    });

    return NextResponse.json({
      message: "Announcement created successfully.",
      announcement,
    });
  } catch (error) {
    console.error("ADMIN_ANNOUNCEMENTS_POST_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create announcement." },
      { status: 500 }
    );
  }
}