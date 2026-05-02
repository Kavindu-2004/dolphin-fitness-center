import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { addMonths, format } from "date-fns";
import { PaymentMethod, SubscriptionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { saveProfileImage } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidPaymentMethod(value: string): value is PaymentMethod {
  return (
    value === "CASH" ||
    value === "CARD" ||
    value === "BANK_TRANSFER" ||
    value === "ONLINE"
  );
}

async function safeSaveProfileImage(profileImageFile: File | null) {
  if (!profileImageFile) {
    return null;
  }

  try {
    return await saveProfileImage(profileImageFile);
  } catch (error) {
    console.error("PROFILE_IMAGE_UPLOAD_ERROR:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let data: Record<string, string> = {};
    let profileImageFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      data = {
        firstName: String(formData.get("firstName") || "").trim(),
        lastName: String(formData.get("lastName") || "").trim(),
        age: String(formData.get("age") || "").trim(),
        address: String(formData.get("address") || "").trim(),
        email: String(formData.get("email") || "").trim().toLowerCase(),
        phone: String(formData.get("phone") || "").trim(),
        password: String(formData.get("password") || ""),
        planId: String(formData.get("planId") || "").trim(),
        coachId: String(formData.get("coachId") || "").trim(),
        paymentMethod: String(formData.get("paymentMethod") || "CASH"),
      };

      const uploadedFile = formData.get("profileImage");

      if (uploadedFile instanceof File && uploadedFile.size > 0) {
        profileImageFile = uploadedFile;
      }
    } else {
      const body = await req.json();

      data = {
        firstName: String(body.firstName || "").trim(),
        lastName: String(body.lastName || "").trim(),
        age: String(body.age || "").trim(),
        address: String(body.address || "").trim(),
        email: String(body.email || "").trim().toLowerCase(),
        phone: String(body.phone || "").trim(),
        password: String(body.password || ""),
        planId: String(body.planId || "").trim(),
        coachId: String(body.coachId || "").trim(),
        paymentMethod: String(body.paymentMethod || "CASH"),
      };
    }

    const {
      firstName,
      lastName,
      age,
      address,
      email,
      phone,
      password,
      planId,
      coachId,
      paymentMethod,
    } = data;

    if (
      !firstName ||
      !lastName ||
      !age ||
      !address ||
      !email ||
      !phone ||
      !password ||
      !planId
    ) {
      return NextResponse.json(
        { message: "Please fill all required fields and select a plan." },
        { status: 400 }
      );
    }

    const ageNumber = Number(age);

    if (Number.isNaN(ageNumber) || ageNumber <= 0) {
      return NextResponse.json(
        { message: "Please enter a valid age." },
        { status: 400 }
      );
    }

    if (!isValidPaymentMethod(paymentMethod)) {
      return NextResponse.json(
        { message: "Invalid payment method." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        member: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "This email is already registered. A member can have only one active subscription.",
        },
        { status: 400 }
      );
    }

    const selectedPlan = await prisma.membershipPlan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!selectedPlan || !selectedPlan.isActive) {
      return NextResponse.json(
        { message: "Selected membership plan is not available." },
        { status: 400 }
      );
    }

    if (selectedPlan.requiresCoach && !coachId) {
      return NextResponse.json(
        { message: `Please select a coach for ${selectedPlan.name}.` },
        { status: 400 }
      );
    }

    let validCoachId: string | null = null;

    if (selectedPlan.requiresCoach) {
      const coach = await prisma.coach.findUnique({
        where: {
          id: coachId,
        },
      });

      if (!coach) {
        return NextResponse.json(
          { message: "Selected coach was not found." },
          { status: 400 }
        );
      }

      validCoachId = coach.id;
    }

    const validSubscriptionType: SubscriptionType =
      selectedPlan.isPersonalTraining || selectedPlan.requiresCoach
        ? "PERSONAL_TRAINING"
        : "NORMAL_MONTHLY";

    const validPaymentMethod = paymentMethod as PaymentMethod;

    const profileImage = await safeSaveProfileImage(profileImageFile);

    const monthlyFee = selectedPlan.monthlyFee;
    const personalTrainingFee =
      selectedPlan.isPersonalTraining || selectedPlan.requiresCoach
        ? selectedPlan.monthlyFee
        : 0;

    const totalMonthlyFee = selectedPlan.monthlyFee;

    const hashedPassword = await bcrypt.hash(password, 10);

    const startDate = new Date();
    const nextDueDate = addMonths(startDate, 1);
    const memberNo = `DFC-${Date.now()}`;
    const fullName = `${firstName} ${lastName}`;

    const user = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          firstName,
          lastName,
          name: fullName,
          email,
          phone,
          password: hashedPassword,
          role: "MEMBER",
          member: {
            create: {
              memberNo,
              age: ageNumber,
              address,
              profileImage,
              subscription: {
                create: {
                  planId: selectedPlan.id,
                  type: validSubscriptionType,
                  status: "ACTIVE",
                  monthlyFee,
                  personalTrainingFee,
                  totalMonthlyFee,
                  coachId: validCoachId,
                  startDate,
                  nextDueDate,
                  lastPaidDate: startDate,
                },
              },
              payments: {
                create: {
                  amount: totalMonthlyFee,
                  method: validPaymentMethod,
                  status: "PAID",
                  paidForMonth: format(startDate, "MMMM yyyy"),
                  paidAt: startDate,
                  dueDate: nextDueDate,
                  note: `Initial registration payment - ${selectedPlan.name}`,
                },
              },
            },
          },
        },
        include: {
          member: {
            include: {
              subscription: {
                include: {
                  plan: true,
                  coach: true,
                },
              },
              payments: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      message: "Registration successful",
      user,
    });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}