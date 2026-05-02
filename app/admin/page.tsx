"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  Dumbbell,
  Flame,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

type DashboardData = {
  settings: {
    gymName: string;
    monthlyFee: number;
    personalTrainingFee: number;
    currency: string;
  };
  stats: {
    totalMembers: number;
    activePlans: number;
    monthlyIncome: number;
    dueSoon: number;
  };
  dueSoon: {
    id: string;
    memberNo: string;
    name: string;
    email: string;
    phone: string;
    profileImage: string | null;
    plan: string;
    amount: number;
    nextDueDate: string;
    daysLeft: number;
  }[];
};

const tasks = [
  "Member registration completed",
  "Payment records connected",
  "Admin member details completed",
  "Body profile update form completed",
  "Reminder dashboard completed",
  "Monthly income reports completed",
];

const modules = [
  {
    title: "Member Intelligence",
    text: "View member details, subscription, payment status, and body profile from one place.",
    icon: Users,
  },
  {
    title: "Payment Control",
    text: "Track monthly fee, personal training fee, due dates, and overdue payments.",
    icon: WalletCards,
  },
  {
    title: "Coach Assignment",
    text: "Assign personal training clients to one of the gym coaches.",
    icon: Dumbbell,
  },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard");
        const dashboardData = await res.json();

        if (res.ok) {
          setData(dashboardData);
        }
      } catch (error) {
        console.error("LOAD_DASHBOARD_ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = [
    {
      title: "Total Members",
      value: data ? data.stats.totalMembers.toString() : "0",
      subtitle: "Registered members",
      icon: Users,
      trend: "Live database",
    },
    {
      title: "Active Plans",
      value: data ? data.stats.activePlans.toString() : "0",
      subtitle: "Normal + personal training",
      icon: ShieldCheck,
      trend: "Live tracking",
    },
    {
      title: "Monthly Income",
      value: data
        ? `${data.settings.currency} ${data.stats.monthlyIncome.toLocaleString()}`
        : "LKR 0",
      subtitle: "Current month revenue",
      icon: TrendingUp,
      trend: "Payments synced",
    },
    {
      title: "Due Soon",
      value: data ? data.stats.dueSoon.toString() : "0",
      subtitle: "Members near due date",
      icon: CalendarClock,
      trend: "Reminder ready",
    },
  ];

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm font-semibold text-zinc-400 sm:p-8">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="shine-effect flex flex-col justify-between gap-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:bg-white/[0.08] sm:p-8 xl:flex-row xl:items-center">
        <div className="min-w-0">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold text-zinc-300 sm:text-sm">
            <Flame size={16} className="shrink-0" />
            <span className="truncate">Dolphin Fitness Center Admin Command</span>
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
            Command Center
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            Advanced dashboard for monthly subscriptions, personal training,
            body profile management, payment reminders, and coach assignment.
          </p>
        </div>

        <div className="animate-float-medium rounded-[1.5rem] bg-white p-5 text-black sm:p-6 xl:min-w-[280px]">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500 sm:text-sm">
            Base Monthly Fee
          </p>
          <p className="mt-2 break-words text-3xl font-black sm:text-4xl">
            {data?.settings.currency || "LKR"}{" "}
            {(data?.settings.monthlyFee || 0).toLocaleString()}
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-500">
            Personal training: + {data?.settings.currency || "LKR"}{" "}
            {(data?.settings.personalTrainingFee || 0).toLocaleString()}
          </p>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="group rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/[0.09] sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black transition duration-300 group-hover:rotate-6 group-hover:scale-110 sm:h-13 sm:w-13">
                  <Icon size={24} />
                </div>
                <span className="truncate rounded-full border border-white/10 px-3 py-1 text-xs font-black text-zinc-400">
                  {item.trend}
                </span>
              </div>

              <h2 className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 sm:text-sm">
                {item.title}
              </h2>
              <p className="mt-3 break-words text-3xl font-black sm:text-4xl">
                {item.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-500">
                {item.subtitle}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 sm:mt-8 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:bg-white/[0.08] sm:p-6 xl:col-span-2">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black sm:text-2xl">
                Upcoming Payment Due Dates
              </h2>
              <p className="mt-1 text-sm font-semibold text-zinc-500">
                Members close to their monthly payment date will appear here.
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
              <CalendarClock />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-white/10">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-white text-black">
                <tr>
                  <th className="px-5 py-4">Member</th>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Due Date</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {!data || data.dueSoon.length === 0 ? (
                  <tr className="border-t border-white/10">
                    <td className="px-5 py-6 text-zinc-500" colSpan={5}>
                      No upcoming due payments within the next 7 days.
                    </td>
                  </tr>
                ) : (
                  data.dueSoon.map((member) => (
                    <tr key={member.id} className="border-t border-white/10">
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-2xl bg-white text-black">
                            {member.profileImage ? (
                              <img
                                src={member.profileImage}
                                alt={member.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Users size={18} />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-black">{member.name}</p>
                            <p className="text-xs font-bold text-zinc-500">
                              {member.memberNo}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5 font-bold text-zinc-300">
                        {member.plan}
                      </td>

                      <td className="px-5 py-5 font-black">
                        {data.settings.currency} {member.amount.toLocaleString()}
                      </td>

                      <td className="px-5 py-5 font-bold text-zinc-300">
                        {new Date(member.nextDueDate).toLocaleDateString()}{" "}
                        <span className="text-zinc-500">
                          ({member.daysLeft} days)
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <Link
                          href={`/admin/members/${member.id}`}
                          className="rounded-full bg-white px-4 py-2 text-xs font-black text-black transition hover:bg-zinc-200"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <div
                  key={module.title}
                  className="group rounded-[1.5rem] border border-white/10 bg-black/30 p-5 transition duration-300 hover:-translate-y-1 hover:bg-black/50"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 font-black">{module.title}</h3>
                  <p className="mt-2 text-xs font-semibold leading-5 text-zinc-500">
                    {module.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="shine-effect rounded-[2rem] border border-white/10 bg-white p-5 text-black shadow-2xl transition duration-300 hover:-translate-y-2 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                <Activity size={22} />
              </div>
              <ArrowUpRight />
            </div>

            <h2 className="mt-6 text-2xl font-black">System Health</h2>
            <p className="mt-2 text-sm font-semibold text-zinc-500">
              Database connected. Dashboard is now reading live Prisma data.
            </p>

            <div className="mt-6 space-y-4">
              <Health label="Database" value="Live" />
              <Health label="Prisma" value="Connected" />
              <Health label="Dashboard" value="Dynamic" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:bg-white/[0.08] sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
              <AlertTriangle size={22} />
            </div>

            <h2 className="mt-6 text-2xl font-black">Build Status</h2>

            <div className="mt-5 space-y-3">
              {tasks.map((task) => (
                <div
                  key={task}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-zinc-300 transition duration-300 hover:translate-x-1 hover:bg-black/50 sm:hover:translate-x-2"
                >
                  {task}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Health({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-100 px-4 py-3 transition duration-300 hover:scale-[1.02]">
      <p className="text-sm font-black">{label}</p>
      <span className="shrink-0 rounded-full bg-black px-3 py-1 text-xs font-black text-white">
        {value}
      </span>
    </div>
  );
}