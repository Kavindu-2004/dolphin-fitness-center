import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          priority: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 6,
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("PUBLIC_ANNOUNCEMENTS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load announcements." },
      { status: 500 }
    );
  }
}