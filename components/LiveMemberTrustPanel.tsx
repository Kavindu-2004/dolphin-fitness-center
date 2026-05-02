import { prisma } from "@/lib/prisma";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Dumbbell,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getLiveTrustData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalMembers,
    activeSubscriptions,
    expiredSubscriptions,
    monthlyPayments,
    bodyProfiles,
    personalTrainingMembers,
  ] = await Promise.all([
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

    prisma.payment.count({
      where: {
        status: "PAID",
        paidAt: {
          gte: startOfMonth,
        },
      },
    }),

    prisma.bodyProfile.count(),

    prisma.subscription.count({
      where: {
        type: "PERSONAL_TRAINING",
        status: "ACTIVE",
      },
    }),
  ]);

  return {
    totalMembers,
    activeSubscriptions,
    expiredSubscriptions,
    monthlyPayments,
    bodyProfiles,
    personalTrainingMembers,
  };
}

export default async function LiveMemberTrustPanel() {
  const data = await getLiveTrustData();

  const activePercentage =
    data.totalMembers > 0
      ? Math.round((data.activeSubscriptions / data.totalMembers) * 100)
      : 0;

  return (
    <section className="relative z-10 mt-10 w-full max-w-3xl sm:mt-12">
      <div className="shine-effect relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl transition duration-500 hover:bg-white/[0.09] sm:p-6 sm:hover:-translate-y-2">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-48 w-48 rounded-full bg-white/10 blur-3xl sm:h-56 sm:w-56" />
          <div className="absolute -bottom-24 right-0 h-48 w-48 rounded-full bg-zinc-500/20 blur-3xl sm:h-56 sm:w-56" />
        </div>

        <div className="relative z-10 min-w-0">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400 sm:text-xs sm:tracking-[0.2em]">
                <Activity size={15} className="shrink-0" />
                <span className="truncate">Live Member Tracking</span>
              </div>

              <h2 className="mt-5 break-words text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
                Real gym activity. Real member control.
              </h2>

              <p className="mt-3 max-w-xl break-words text-sm font-semibold leading-6 text-zinc-500">
                This system tracks members, subscriptions, payments, renewals,
                personal coaching, and body profile progress in one smart gym
                dashboard.
              </p>
            </div>

            <div className="w-full shrink-0 rounded-3xl bg-white px-5 py-4 text-black sm:w-auto">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                Active Rate
              </p>
              <p className="mt-1 break-words text-3xl font-black">
                {activePercentage}%
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <TrustStat
              icon={<Users size={19} />}
              label="Total Members"
              value={data.totalMembers.toString()}
            />

            <TrustStat
              icon={<ShieldCheck size={19} />}
              label="Active Plans"
              value={data.activeSubscriptions.toString()}
            />

            <TrustStat
              icon={<WalletCards size={19} />}
              label="Monthly Payments"
              value={data.monthlyPayments.toString()}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <TrustStat
              icon={<Dumbbell size={19} />}
              label="PT Members"
              value={data.personalTrainingMembers.toString()}
            />

            <TrustStat
              icon={<TrendingUp size={19} />}
              label="Body Profiles"
              value={data.bodyProfiles.toString()}
            />

            <TrustStat
              icon={<CalendarClock size={19} />}
              label="Expired Plans"
              value={data.expiredSubscriptions.toString()}
            />
          </div>

          <div className="mt-7 rounded-[1.5rem] border border-white/10 bg-black/40 p-4 sm:p-5">
            <div className="flex min-w-0 items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="break-words text-sm font-black text-white">
                  Why this builds trust
                </p>
                <p className="mt-1 break-words text-xs font-semibold leading-5 text-zinc-500">
                  Visitors can see that the gym uses a professional digital
                  system for membership, payments, reminders, and progress.
                </p>
              </div>

              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black sm:flex">
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white transition-all duration-1000"
                style={{
                  width: `${Math.min(activePercentage, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group min-w-0 rounded-[1.5rem] border border-white/10 bg-black/30 p-4 transition duration-300 hover:bg-white hover:text-black sm:hover:-translate-y-1">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black transition duration-300 group-hover:bg-black group-hover:text-white">
        {icon}
      </div>

      <p className="mt-4 break-words text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500 sm:text-xs sm:tracking-[0.18em]">
        {label}
      </p>

      <p className="mt-1 break-words text-2xl font-black">{value}</p>
    </div>
  );
}