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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: {
        id,
      },
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { message: "Announcement not found." },
        { status: 404 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let title = "";
    let message = "";
    let type = "NOTICE";
    let eventDateValue = "";
    let isActive = true;
    let priority = 1;
    let imageFile: File | null = null;
    let removeImage = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      title = String(formData.get("title") || "").trim();
      message = String(formData.get("message") || "").trim();
      type = String(formData.get("type") || "NOTICE");
      eventDateValue = String(formData.get("eventDate") || "");
      isActive = toBoolean(formData.get("isActive"));
      priority = Number(formData.get("priority") || 1);
      removeImage = toBoolean(formData.get("removeImage"));

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
      removeImage = toBoolean(body.removeImage);
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

    const uploadedImageUrl = await saveAnnouncementImage(imageFile);

    const imageUrl = uploadedImageUrl
      ? uploadedImageUrl
      : removeImage
      ? null
      : existingAnnouncement.imageUrl;

    const updatedAnnouncement = await prisma.announcement.update({
      where: {
        id,
      },
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
      message: "Announcement updated successfully.",
      announcement: updatedAnnouncement,
    });
  } catch (error) {
    console.error("ADMIN_ANNOUNCEMENT_PUT_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update announcement." },
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

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: {
        id,
      },
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { message: "Announcement not found." },
        { status: 404 }
      );
    }

    await prisma.announcement.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Announcement deleted successfully.",
    });
  } catch (error) {
    console.error("ADMIN_ANNOUNCEMENT_DELETE_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete announcement." },
      { status: 500 }
    );
  }
}