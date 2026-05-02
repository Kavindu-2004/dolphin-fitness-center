import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calculateBMI(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
}

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: {
        user: true,
        subscription: true,
        bodyProfiles: {
          orderBy: {
            measuredAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("BODY_PROFILE_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load body profiles." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      memberId,
      heightCm,
      weightKg,
      chest,
      waist,
      hip,
      biceps,
      thigh,
      bodyFat,
      notes,
    } = body;

    if (!memberId || !heightCm || !weightKg) {
      return NextResponse.json(
        { message: "Member, height, and weight are required." },
        { status: 400 }
      );
    }

    const height = Number(heightCm);
    const weight = Number(weightKg);

    if (Number.isNaN(height) || Number.isNaN(weight) || height <= 0 || weight <= 0) {
      return NextResponse.json(
        { message: "Please enter valid height and weight." },
        { status: 400 }
      );
    }

    const bmi = calculateBMI(height, weight);

    const profile = await prisma.bodyProfile.create({
      data: {
        memberId,
        heightCm: height,
        weightKg: weight,
        bmi,
        chest: chest ? Number(chest) : null,
        waist: waist ? Number(waist) : null,
        hip: hip ? Number(hip) : null,
        biceps: biceps ? Number(biceps) : null,
        thigh: thigh ? Number(thigh) : null,
        bodyFat: bodyFat ? Number(bodyFat) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      message: "Body profile saved successfully.",
      profile,
    });
  } catch (error) {
    console.error("BODY_PROFILE_POST_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to save body profile." },
      { status: 500 }
    );
  }
}