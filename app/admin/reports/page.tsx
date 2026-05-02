"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Download,
  FileDown,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

type ReportData = {
  totals: {
    totalMembers: number;
    activeMembers: number;
    expiredMembers: number;
    normalMembers: number;
    personalTrainingMembers: number;
    totalPayments: number;
    totalIncome: number;
    monthlyIncome: number;
    todayIncome: number;
    normalIncome: number;
    personalTrainingIncome: number;
  };
  charts: {
    subscriptionData: {
      name: string;
      value: number;
    }[];
    incomeBreakdownData: {
      name: string;
      value: number;
    }[];
    paymentMethodData: {
      name: string;
      value: number;
    }[];
    monthlyIncomeData: {
      month: string;
      income: number;
    }[];
  };
  recentPayments: {
    id: string;
    memberName: string;
    memberNo: string;
    amount: number;
    method: string;
    status: string;
    paidForMonth: string;
    paidAt: string;
  }[];
  generatedAt: string;
};

export default function AdminReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadReports() {
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();

      if (res.ok) {
        setReport(data);
      }
    } catch (error) {
      console.error("LOAD_REPORTS_ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const csvRows = useMemo(() => {
    if (!report) return [];

    return report.recentPayments.map((payment) => ({
      Member: payment.memberName,
      "Member No": payment.memberNo,
      Amount: payment.amount,
      Method: payment.method,
      Status: payment.status,
      Month: payment.paidForMonth,
      "Paid Date": new Date(payment.paidAt).toLocaleDateString(),
    }));
  }, [report]);

  function downloadCSV() {
    if (!report) return;

    const headers = [
      "Member",
      "Member No",
      "Amount",
      "Method",
      "Status",
      "Month",
      "Paid Date",
    ];

    const rows = csvRows.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof typeof row];
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `dolphin-fitness-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
        Loading reports...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
        Failed to load report data.
      </div>
    );
  }

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
          Admin Reports
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">
              Business Reports
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Analyze gym memberships, personal training clients, payment
              records, and monthly income performance.
            </p>
          </div>

          <button
            onClick={downloadCSV}
            className="shine-effect inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:scale-[1.02] sm:w-fit sm:text-base"
          >
            <Download size={18} />
            Download CSV
          </button>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<Users size={22} />}
          label="Total Members"
          value={report.totals.totalMembers.toString()}
        />
        <SummaryCard
          icon={<TrendingUp size={22} />}
          label="Monthly Income"
          value={`LKR ${report.totals.monthlyIncome.toLocaleString()}`}
        />
        <SummaryCard
          icon={<WalletCards size={22} />}
          label="Total Income"
          value={`LKR ${report.totals.totalIncome.toLocaleString()}`}
        />
        <SummaryCard
          icon={<BarChart3 size={22} />}
          label="Total Payments"
          value={report.totals.totalPayments.toString()}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Subscription Breakdown">
          <div className="h-[260px] w-full sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.charts.subscriptionData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius="75%"
                  label
                >
                  {report.charts.subscriptionData.map((_, index) => (
                    <Cell key={`cell-sub-${index}`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#000",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Income Breakdown">
          <div className="h-[260px] w-full overflow-x-auto sm:h-[280px]">
            <div className="h-full min-w-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.charts.incomeBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `LKR ${Number(value).toLocaleString()}`
                    }
                    contentStyle={{
                      background: "#000",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "16px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Payment Method Income">
          <div className="h-[260px] w-full overflow-x-auto sm:h-[280px]">
            <div className="h-full min-w-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.charts.paymentMethodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `LKR ${Number(value).toLocaleString()}`
                    }
                    contentStyle={{
                      background: "#000",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "16px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Monthly Income Trend">
          <div className="h-[260px] w-full overflow-x-auto sm:h-[280px]">
            <div className="h-full min-w-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.charts.monthlyIncomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `LKR ${Number(value).toLocaleString()}`
                    }
                    contentStyle={{
                      background: "#000",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "16px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="income" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h2 className="text-xl font-black sm:text-2xl">
              Recent Payments
            </h2>
            <p className="mt-1 text-sm font-semibold text-zinc-500">
              Latest payment records saved in the system.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
            <FileDown />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-white/10">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-white text-black">
              <tr>
                <th className="px-5 py-4">Member</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Method</th>
                <th className="px-5 py-4">Month</th>
                <th className="px-5 py-4">Paid Date</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {report.recentPayments.length === 0 ? (
                <tr>
                  <td className="px-5 py-5 text-zinc-500" colSpan={6}>
                    No payment records available.
                  </td>
                </tr>
              ) : (
                report.recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-t border-white/10">
                    <td className="px-5 py-5">
                      <p className="font-black">{payment.memberName}</p>
                      <p className="text-xs font-bold text-zinc-500">
                        {payment.memberNo}
                      </p>
                    </td>

                    <td className="px-5 py-5 font-black">
                      LKR {payment.amount.toLocaleString()}
                    </td>

                    <td className="px-5 py-5 font-bold text-zinc-300">
                      {payment.method}
                    </td>

                    <td className="px-5 py-5 font-bold text-zinc-300">
                      {payment.paidForMonth}
                    </td>

                    <td className="px-5 py-5 font-bold text-zinc-300">
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-5">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs font-bold text-zinc-600 sm:hidden">
          Swipe left/right to view the full payment table.
        </p>
      </section>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.09] sm:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
        {icon}
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 sm:text-sm">
        {label}
      </p>
      <p className="mt-2 break-words text-2xl font-black sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <h2 className="break-words text-xl font-black sm:text-2xl">{title}</h2>
      <div className="mt-6 rounded-[1.5rem] bg-white p-3 text-black sm:p-4">
        {children}
      </div>
    </div>
  );
}