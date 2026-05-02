import { NextResponse } from "next/server";
import {
  endOfMonth,
  endOfToday,
  format,
  isWithinInterval,
  startOfMonth,
  startOfToday,
} from "date-fns";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: {
        user: true,
        subscription: {
          include: {
            coach: true,
          },
        },
        payments: true,
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

    const payments = await prisma.payment.findMany({
      include: {
        member: {
          include: {
            user: true,
            subscription: true,
          },
        },
      },
      orderBy: {
        paidAt: "desc",
      },
    });

    const now = new Date();

    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const paidPayments = payments.filter((payment) => payment.status === "PAID");

    const monthlyPayments = paidPayments.filter((payment) =>
      isWithinInterval(new Date(payment.paidAt), {
        start: monthStart,
        end: monthEnd,
      })
    );

    const todayPayments = paidPayments.filter((payment) =>
      isWithinInterval(new Date(payment.paidAt), {
        start: todayStart,
        end: todayEnd,
      })
    );

    const totalIncome = paidPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const monthlyIncome = monthlyPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const todayIncome = todayPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const activeMembers = members.filter(
      (member) => member.subscription?.status === "ACTIVE"
    ).length;

    const expiredMembers = members.filter(
      (member) => member.subscription?.status === "EXPIRED"
    ).length;

    const normalMembers = members.filter(
      (member) => member.subscription?.type === "NORMAL_MONTHLY"
    ).length;

    const personalTrainingMembers = members.filter(
      (member) => member.subscription?.type === "PERSONAL_TRAINING"
    ).length;

    const normalIncome = paidPayments
      .filter(
        (payment) =>
          payment.member.subscription?.type === "NORMAL_MONTHLY"
      )
      .reduce((sum, payment) => sum + payment.amount, 0);

    const personalTrainingIncome = paidPayments
      .filter(
        (payment) =>
          payment.member.subscription?.type === "PERSONAL_TRAINING"
      )
      .reduce((sum, payment) => sum + payment.amount, 0);

    const paymentMethodMap = new Map<string, number>();

    paidPayments.forEach((payment) => {
      const current = paymentMethodMap.get(payment.method) || 0;
      paymentMethodMap.set(payment.method, current + payment.amount);
    });

    const paymentMethodData = Array.from(paymentMethodMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    const subscriptionData = [
      {
        name: "Normal Monthly",
        value: normalMembers,
      },
      {
        name: "Personal Training",
        value: personalTrainingMembers,
      },
    ];

    const incomeBreakdownData = [
      {
        name: "Normal Monthly",
        value: normalIncome,
      },
      {
        name: "Personal Training",
        value: personalTrainingIncome,
      },
    ];

    const monthlyIncomeMap = new Map<string, number>();

    paidPayments.forEach((payment) => {
      const month = format(new Date(payment.paidAt), "MMM yyyy");
      const current = monthlyIncomeMap.get(month) || 0;
      monthlyIncomeMap.set(month, current + payment.amount);
    });

    const monthlyIncomeData = Array.from(monthlyIncomeMap.entries()).map(
      ([month, income]) => ({
        month,
        income,
      })
    );

    const recentPayments = payments.slice(0, 10).map((payment) => ({
      id: payment.id,
      memberName: payment.member.user.name,
      memberNo: payment.member.memberNo,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      paidForMonth: payment.paidForMonth,
      paidAt: payment.paidAt,
    }));

    return NextResponse.json({
      totals: {
        totalMembers: members.length,
        activeMembers,
        expiredMembers,
        normalMembers,
        personalTrainingMembers,
        totalPayments: payments.length,
        totalIncome,
        monthlyIncome,
        todayIncome,
        normalIncome,
        personalTrainingIncome,
      },
      charts: {
        subscriptionData,
        incomeBreakdownData,
        paymentMethodData,
        monthlyIncomeData,
      },
      recentPayments,
      generatedAt: now,
    });
  } catch (error) {
    console.error("ADMIN_REPORTS_GET_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load reports." },
      { status: 500 }
    );
  }
}