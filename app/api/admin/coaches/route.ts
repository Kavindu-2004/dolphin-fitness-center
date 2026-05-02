import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const coaches = await prisma.coach.findMany({
      include: {
        subscriptions: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(coaches);
  } catch (error) {
    console.error("ADMIN_COACHES_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load coaches." },
      { status: 500 }
    );
  }
}