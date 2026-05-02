import { NextResponse } from "next/server";
import { differenceInCalendarDays } from "date-fns";
import { ReminderType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();

    await prisma.subscription.updateMany({
      where: {
        status: "ACTIVE",
        nextDueDate: {
          lt: today,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    const settings = await prisma.systemSetting.findFirst();
    const reminderDaysBefore = settings?.reminderDaysBefore || 3;

    const members = await prisma.member.findMany({
      include: {
        user: true,
        subscription: {
          include: {
            coach: true,
          },
        },
        reminders: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const reminderMembers = members
      .map((member) => {
        const subscription = member.subscription;

        if (!subscription) {
          return null;
        }

        const dueDate = subscription.nextDueDate;
        const daysLeft = differenceInCalendarDays(dueDate, today);

        let reminderStatus = "Not Urgent";

        if (daysLeft < 0) {
          reminderStatus = "Overdue";
        } else if (daysLeft === 0) {
          reminderStatus = "Due Today";
        } else if (daysLeft <= reminderDaysBefore) {
          reminderStatus = "Due Soon";
        }

        return {
          id: member.id,
          memberNo: member.memberNo,
          age: member.age,
          address: member.address,
          profileImage: member.profileImage,
          name: member.user.name,
          email: member.user.email,
          phone: member.user.phone,
          subscriptionType: subscription.type,
          subscriptionStatus: subscription.status,
          totalMonthlyFee: subscription.totalMonthlyFee,
          nextDueDate: subscription.nextDueDate,
          daysLeft,
          reminderStatus,
          latestReminder: member.reminders[0] || null,
          coach: subscription.coach,
        };
      })
      .filter((member) => member !== null)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return NextResponse.json(reminderMembers);
  } catch (error) {
    console.error("ADMIN_REMINDERS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load reminders." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { memberId, type, message, dueDate } = body;

    if (!memberId || !type || !message || !dueDate) {
      return NextResponse.json(
        { message: "Member, reminder type, message, and due date are required." },
        { status: 400 }
      );
    }

    if (type !== "EMAIL" && type !== "SMS" && type !== "WHATSAPP") {
      return NextResponse.json(
        { message: "Invalid reminder type." },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
      include: {
        user: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { message: "Member not found." },
        { status: 404 }
      );
    }

    const reminder = await prisma.reminder.create({
      data: {
        memberId,
        type: type as ReminderType,
        status: "SENT",
        message,
        sentAt: new Date(),
        dueDate: new Date(dueDate),
      },
    });

    return NextResponse.json({
      message: `${type} reminder recorded successfully.`,
      reminder,
    });
  } catch (error) {
    console.error("ADMIN_REMINDERS_POST_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to record reminder." },
      { status: 500 }
    );
  }
}