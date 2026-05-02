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

async function getUniqueSlug(title: string, currentBlogId: string) {
  const baseSlug = createSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingPost = await prisma.blogPost.findUnique({
      where: {
        slug,
      },
    });

    if (!existingPost || existingPost.id === currentBlogId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingBlog = await prisma.blogPost.findUnique({
      where: {
        id,
      },
    });

    if (!existingBlog) {
      return NextResponse.json(
        { message: "Blog not found." },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const title = String(formData.get("title") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const isPublished = toBoolean(formData.get("isPublished"));
    const isFeatured = toBoolean(formData.get("isFeatured"));
    const priority = Number(formData.get("priority") || 1);
    const removeCoverImage = toBoolean(formData.get("removeCoverImage"));

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

    const slug = await getUniqueSlug(title, id);
    const uploadedCoverImage = await saveBlogCoverImage(coverImageFile);

    const updatedBlog = await prisma.blogPost.update({
      where: {
        id,
      },
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage: removeCoverImage
          ? null
          : uploadedCoverImage || existingBlog.coverImage,
        isPublished,
        isFeatured,
        priority,
      },
    });

    return NextResponse.json({
      message: "Blog updated successfully.",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("ADMIN_BLOG_PUT_ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to update blog.",
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

    const existingBlog = await prisma.blogPost.findUnique({
      where: {
        id,
      },
    });

    if (!existingBlog) {
      return NextResponse.json(
        { message: "Blog not found." },
        { status: 404 }
      );
    }

    await prisma.blogPost.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Blog deleted successfully.",
    });
  } catch (error) {
    console.error("ADMIN_BLOG_DELETE_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete blog." },
      { status: 500 }
    );
  }
}