import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveBlogCoverImage } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true";
  }

  return Boolean(value);
}

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function getUniqueSlug(title: string) {
  const baseSlug = createSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingPost = await prisma.blogPost.findUnique({
      where: {
        slug,
      },
    });

    if (!existingPost) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function GET() {
  try {
    const blogs = await prisma.blogPost.findMany({
      orderBy: [
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
    console.error("ADMIN_BLOGS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load blogs." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const title = String(formData.get("title") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const isPublished = toBoolean(formData.get("isPublished"));
    const isFeatured = toBoolean(formData.get("isFeatured"));
    const priority = Number(formData.get("priority") || 1);

    const uploadedFile = formData.get("coverImage");
    const coverImageFile =
      uploadedFile instanceof File && uploadedFile.size > 0
        ? uploadedFile
        : null;

    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and content are required." },
        { status: 400 }
      );
    }

    if (Number.isNaN(priority) || priority < 1 || priority > 5) {
      return NextResponse.json(
        { message: "Priority must be between 1 and 5." },
        { status: 400 }
      );
    }

    const slug = await getUniqueSlug(title);
    const coverImage = await saveBlogCoverImage(coverImageFile);

    const blog = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage,
        isPublished,
        isFeatured,
        priority,
      },
    });

    return NextResponse.json({
      message: "Blog created successfully.",
      blog,
    });
  } catch (error) {
    console.error("ADMIN_BLOGS_POST_ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create blog.",
      },
      { status: 500 }
    );
  }
}