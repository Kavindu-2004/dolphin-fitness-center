import GymAnnouncements from "@/components/GymAnnouncements";
import GymVideoShowcase from "@/components/GymVideoShowcase";
import DynamicGymVideos from "@/components/DynamicGymVideos";
import PublicFeeCards from "@/components/PublicFeeCards";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import ClientTestimonials from "@/components/ClientTestimonials";
import LiveChatWidget from "@/components/LiveChatWidget";
import JoinUsPopup from "@/components/JoinUsPopup";
import LiveMemberTrustPanel from "@/components/LiveMemberTrustPanel";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  ArrowRight,
  BellRing,
  Brain,
  CalendarClock,
  CheckCircle2,
  Crown,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  WalletCards,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: WalletCards,
    title: "Smart Monthly Payments",
    text: "Members pay during registration and continue with monthly subscriptions based on current gym settings.",
  },
  {
    icon: BellRing,
    title: "Payment Reminders",
    text: "Send email and phone reminders when a member is close to the due date.",
  },
  {
    icon: Activity,
    title: "Body Profile Tracking",
    text: "Admin updates measurements after physically collecting them at the gym.",
  },
  {
    icon: UserRoundCheck,
    title: "Personal Coaching",
    text: "Diamond membership members can select personal training and choose a coach.",
  },
];

const defaultPlans = [
  {
    name: "Silver Membership",
    slug: "silver-membership",
    description: "Basic monthly gym membership for regular gym access.",
    monthlyFee: 3500,
    features:
      "Monthly gym access\nPayment reminder support\nMember profile access\nBody profile tracking",
    isActive: true,
    isPersonalTraining: false,
    requiresCoach: false,
    priority: 1,
  },
  {
    name: "Gold Membership",
    slug: "gold-membership",
    description: "Improved membership package for committed gym members.",
    monthlyFee: 5000,
    features:
      "Everything in Silver\nPriority member support\nProgress tracking\nWorkout guidance",
    isActive: true,
    isPersonalTraining: false,
    requiresCoach: false,
    priority: 2,
  },
  {
    name: "Platinum Membership",
    slug: "platinum-membership",
    description: "Advanced membership package for serious training goals.",
    monthlyFee: 7500,
    features:
      "Everything in Gold\nAdvanced body profile tracking\nTraining progress support\nPremium gym access",
    isActive: true,
    isPersonalTraining: false,
    requiresCoach: false,
    priority: 3,
  },
  {
    name: "Diamond Membership",
    slug: "diamond-membership",
    description:
      "Personal training membership with coach selection and advanced progress support.",
    monthlyFee: 15000,
    features:
      "Everything in Platinum\nPersonal training included\nChoose your coach\nAdvanced progress support",
    isActive: true,
    isPersonalTraining: true,
    requiresCoach: true,
    priority: 4,
  },
];

async function seedDefaultPlansIfEmpty() {
  const count = await prisma.membershipPlan.count();

  if (count > 0) {
    return;
  }

  await prisma.membershipPlan.createMany({
    data: defaultPlans,
  });
}

async function getPublicBrandSettings() {
  const settings = await prisma.systemSetting.findFirst();

  return {
    gymName: settings?.gymName || "Dolphin Fitness Center",
    logoUrl: settings?.logoUrl || null,
    currency: settings?.currency || "LKR",
  };
}

async function getMembershipPlans() {
  await seedDefaultPlansIfEmpty();

  const plans = await prisma.membershipPlan.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        priority: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  return plans;
}

export default async function Home() {
  const brand = await getPublicBrandSettings();
  const membershipPlans = await getMembershipPlans();

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <PublicNavbar />

      <DynamicGymVideos />

      <div className="pointer-events-none fixed inset-0">
        <div className="animate-glow-pulse absolute left-[-30%] top-[-20%] h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl sm:h-[520px] sm:w-[520px]" />
        <div className="animate-float-slow absolute right-[-30%] top-[18%] h-[360px] w-[360px] rounded-full bg-zinc-500/20 blur-3xl sm:h-[520px] sm:w-[520px]" />
        <div className="animate-glow-pulse absolute bottom-[-20%] left-[10%] h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl sm:left-[30%] sm:h-[520px] sm:w-[520px]" />
      </div>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div className="animate-slide-up min-w-0">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300 shadow-2xl backdrop-blur transition duration-300 hover:bg-white/10 sm:text-sm sm:hover:scale-105">
            <Sparkles size={16} className="shrink-0" />
            <span className="truncate">
              Advanced gym membership and payment system
            </span>
          </div>

          <h2 className="mt-7 max-w-4xl break-words text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl md:text-7xl">
            Train stronger. Pay smarter. Track everything.
          </h2>

          <p className="mt-6 max-w-2xl break-words text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
            {brand.gymName} is a futuristic gym platform for monthly
            memberships, personal training, due reminders, payments, coach
            selection, and body profile tracking.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="shine-effect inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-black transition duration-300 hover:bg-zinc-200 sm:w-auto sm:text-base sm:hover:scale-105"
            >
              Start Membership <ArrowRight size={18} />
            </Link>

            <Link
              href="/coaches"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-black text-white backdrop-blur transition duration-300 hover:bg-white/10 sm:w-auto sm:text-base sm:hover:scale-105"
            >
              View Coaches
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl gap-4 sm:mt-12 sm:grid-cols-3">
            <MiniStat value="4" label="Membership plans" />
            <MiniStat value="Diamond" label="Personal coaching" />
            <MiniStat value="3" label="Expert coaches" />
          </div>

          <LiveMemberTrustPanel />
        </div>

        <div className="animate-slide-left relative min-w-0">
          <div className="animate-glow-pulse absolute -inset-4 rounded-[3rem] bg-white/10 blur-3xl sm:-inset-6" />

          <div className="animate-float-medium relative rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/70 p-5 sm:p-6">
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 sm:text-sm sm:tracking-[0.25em]">
                    Live System
                  </p>
                  <h3 className="mt-2 break-words text-xl font-black sm:text-2xl">
                    Membership Control
                  </h3>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-black">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.gymName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Brain size={26} />
                  )}
                </div>
              </div>

              <PublicFeeCards />

              <div className="mt-8 space-y-4">
                <DashboardPreviewRow
                  icon={<CalendarClock size={18} />}
                  title="Next Due Reminder"
                  value="Auto"
                />

                <DashboardPreviewRow
                  icon={<Dumbbell size={18} />}
                  title="Diamond Coaching"
                  value="Coach"
                />

                <DashboardPreviewRow
                  icon={<ShieldCheck size={18} />}
                  title="One Active Subscription"
                  value="Enabled"
                />
              </div>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white p-5 text-black transition duration-300 hover:scale-[1.02]">
                <div className="flex min-w-0 items-center justify-between gap-4">
                  <p className="break-words font-black">
                    Today&apos;s System Status
                  </p>
                  <span className="shrink-0 rounded-full bg-black px-3 py-1 text-xs font-black text-white">
                    Active
                  </span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-200">
                  <div className="h-full w-[78%] rounded-full bg-black transition-all duration-1000" />
                </div>

                <p className="mt-3 break-words text-sm font-semibold text-zinc-500">
                  Ready for registrations, payments, plan changes, and admin
                  management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GymAnnouncements />

      <GymVideoShowcase />

      <ClientTestimonials />

      <section className="relative z-10 border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 xl:grid-cols-4">
          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`animate-slide-up animate-delay-${Math.min(
                  (index + 1) * 100,
                  500
                )} group rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur transition duration-300 hover:bg-white/10 hover:shadow-2xl sm:p-6 sm:hover:-translate-y-2`}
              >
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-black transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <Icon size={24} />
                </div>

                <h3 className="mt-6 break-words text-xl font-black">
                  {item.title}
                </h3>

                <p className="mt-3 break-words text-sm leading-6 text-zinc-400">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 sm:text-sm sm:tracking-[0.3em]">
              Membership Plans
            </p>
            <h2 className="mt-3 break-words text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              Choose your membership
            </h2>
          </div>

          <p className="max-w-xl break-words text-sm leading-6 text-zinc-400 sm:text-base">
            Prices and plans are controlled from the admin dashboard. Members
            can keep only one active subscription. Subscription changes apply
            from the next billing cycle.
          </p>
        </div>

        {membershipPlans.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-sm text-zinc-400 sm:p-8">
            No active membership plans available.
          </div>
        ) : (
          <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
            {membershipPlans.map((plan, index) => {
              const features = (plan.features || "")
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean);

              const highlighted =
                plan.isPersonalTraining ||
                plan.requiresCoach ||
                plan.slug.includes("diamond");

              return (
                <div
                  key={plan.id}
                  className={`shine-effect flex h-full min-w-0 flex-col rounded-[2rem] border p-5 shadow-2xl transition duration-300 sm:p-7 sm:hover:-translate-y-2 ${
                    highlighted
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/[0.06] text-white backdrop-blur"
                  }`}
                >
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="break-words text-xl font-black sm:text-2xl">
                        {plan.name}
                      </h3>

                      <p
                        className={`mt-2 break-words text-sm leading-6 ${
                          highlighted ? "text-zinc-600" : "text-zinc-400"
                        }`}
                      >
                        {plan.description ||
                          "Monthly gym membership with member support."}
                      </p>
                    </div>

                    {highlighted ? (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                        <Crown size={20} />
                      </span>
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
                        <ShieldCheck size={20} />
                      </span>
                    )}
                  </div>

                  <div className="mt-7">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500 sm:text-sm sm:tracking-[0.2em]">
                      Monthly Fee
                    </p>

                    <p className="mt-2 break-words text-3xl font-black sm:text-4xl">
                      {brand.currency} {plan.monthlyFee.toLocaleString()}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-zinc-500">
                      Per month
                    </p>
                  </div>

                  <div className="mt-5">
                    {plan.requiresCoach && (
                      <div className="rounded-2xl bg-black px-4 py-3 text-center text-sm font-black text-white">
                        Coach selection required
                      </div>
                    )}
                  </div>

                  <div className="mt-7 flex-1 space-y-3">
                    {features.slice(0, 5).map((item) => (
                      <div
                        key={item}
                        className="flex min-w-0 items-start gap-3"
                      >
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                        <span className="break-words text-sm font-semibold">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/register?plan=${plan.slug}`}
                    className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-black transition duration-300 hover:scale-[1.02] sm:text-base ${
                      highlighted
                        ? "bg-black text-white hover:bg-zinc-800"
                        : "bg-white text-black hover:bg-zinc-200"
                    }`}
                  >
                    Choose Plan
                  </Link>

                  <div className="min-h-[28px]">
                    {index === 0 && (
                      <p className="mt-4 text-center text-xs font-bold text-zinc-500">
                        Good for beginners
                      </p>
                    )}

                    {highlighted && (
                      <p className="mt-4 text-center text-xs font-bold text-zinc-500">
                        Best for personal training
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <PublicFooter />
      <LiveChatWidget />
      <JoinUsPopup />
    </main>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition duration-300 hover:bg-white/10 sm:hover:-translate-y-1">
      <div className="flex min-w-0 items-center gap-2">
        <Zap size={17} className="shrink-0" />
        <p className="break-words text-xl font-black">{value}</p>
      </div>

      <p className="mt-1 break-words text-sm font-semibold text-zinc-500">
        {label}
      </p>
    </div>
  );
}

function DashboardPreviewRow({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition duration-300 hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between sm:hover:translate-x-1">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black transition duration-300 group-hover:scale-110">
          {icon}
        </div>

        <p className="break-words font-bold">{title}</p>
      </div>

      <p className="break-words font-black text-zinc-300 sm:text-right">
        {value}
      </p>
    </div>
  );
}