import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const coaches = await prisma.coach.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(coaches);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to load coaches" },
      { status: 500 }
    );
  }
}