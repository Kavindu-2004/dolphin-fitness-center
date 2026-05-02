import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const blog = await prisma.blogPost.findFirst({
      where: {
        slug,
        isPublished: true,
      },
    });

    if (!blog) {
      return NextResponse.json(
        { message: "Blog not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error("PUBLIC_BLOG_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load blog." },
      { status: 500 }
    );
  }
}