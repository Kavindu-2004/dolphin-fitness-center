import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const blogs = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [
        {
          isFeatured: "desc",
        },
        {
          priority: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("PUBLIC_BLOGS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load blogs." },
      { status: 500 }
    );
  }
}