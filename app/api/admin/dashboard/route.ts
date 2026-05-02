import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await prisma.subscription.updateMany({
      where: {
        status: "ACTIVE",
        nextDueDate: {
          lt: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    const settings = await prisma.systemSetting.findFirst();

    const [totalMembers, activePlans, expiredPlans, monthlyIncomeData, dueSoonMembers] =
      await Promise.all([
        prisma.member.count(),

        prisma.subscription.count({
          where: {
            status: "ACTIVE",
          },
        }),

        prisma.subscription.count({
          where: {
            status: "EXPIRED",
          },
        }),

        prisma.payment.aggregate({
          where: {
            status: "PAID",
            paidAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        }),

        prisma.member.findMany({
          where: {
            subscription: {
              status: "ACTIVE",
              nextDueDate: {
                gte: now,
                lte: sevenDaysFromNow,
              },
            },
          },
          include: {
            user: true,
            subscription: {
              include: {
                coach: true,
              },
            },
          },
          orderBy: {
            subscription: {
              nextDueDate: "asc",
            },
          },
          take: 10,
        }),
      ]);

    const dueSoon = dueSoonMembers.map((member) => {
      const nextDueDate = member.subscription?.nextDueDate || now;
      const daysLeft = differenceInCalendarDays(nextDueDate, now);

      return {
        id: member.id,
        memberNo: member.memberNo,
        name: member.user.name,
        email: member.user.email,
        phone: member.user.phone,
        profileImage: member.profileImage,
        plan:
          member.subscription?.type === "PERSONAL_TRAINING"
            ? "Personal Training"
            : "Normal Monthly",
        amount: member.subscription?.totalMonthlyFee || 0,
        nextDueDate,
        daysLeft,
      };
    });

    return NextResponse.json({
      settings: {
        gymName: settings?.gymName || "Dolphin Fitness Center",
        monthlyFee: settings?.monthlyFee || 3500,
        personalTrainingFee: settings?.personalTrainingFee || 15000,
        currency: settings?.currency || "LKR",
      },
      stats: {
        totalMembers,
        activePlans,
        expiredPlans,
        monthlyIncome: monthlyIncomeData._sum.amount || 0,
        dueSoon: dueSoon.length,
      },
      dueSoon,
    });
  } catch (error) {
    console.error("ADMIN_DASHBOARD_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load dashboard data." },
      { status: 500 }
    );
  }
}