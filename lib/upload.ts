import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

function getSafeExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) {
    return "jpg";
  }

  return extension;
}

async function saveImageFile(
  file: File | null,
  folderName: string,
  prefix: string
) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public", "uploads", folderName);
  await mkdir(uploadDir, { recursive: true });

  const extension = getSafeExtension(file.name);

  const fileName = `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;

  const filePath = join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  return `/uploads/${folderName}/${fileName}`;
}

async function saveVideoFile(
  file: File | null,
  folderName: string,
  prefix: string
) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("video/")) {
    throw new Error("Only video files are allowed.");
  }

  const maxSizeInMb = 300;
  const maxSizeInBytes = maxSizeInMb * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    throw new Error(`Video file must be smaller than ${maxSizeInMb}MB.`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public", "uploads", folderName);
  await mkdir(uploadDir, { recursive: true });

  const extension = getSafeExtension(file.name);

  const fileName = `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;

  const filePath = join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  return `/uploads/${folderName}/${fileName}`;
}

export async function saveProfileImage(file: File | null) {
  return saveImageFile(file, "profiles", "profile");
}

export async function saveGymLogo(file: File | null) {
  return saveImageFile(file, "logos", "gym-logo");
}

export async function saveCoachImage(file: File | null) {
  return saveImageFile(file, "coaches", "coach");
}

export async function saveAnnouncementImage(file: File | null) {
  return saveImageFile(file, "announcements", "announcement");
}

export async function saveSiteVideo(file: File | null) {
  return saveVideoFile(file, "site-videos", "site-video");
}

export async function saveBlogCoverImage(file: File | null) {
  return saveImageFile(file, "blogs", "blog-cover");
}