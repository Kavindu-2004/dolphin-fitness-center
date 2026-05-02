import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const videos = await prisma.siteVideo.findMany({
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
      take: 2,
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("PUBLIC_SITE_VIDEOS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load public site videos." },
      { status: 500 }
    );
  }
}