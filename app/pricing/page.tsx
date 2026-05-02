import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import JoinUsPopup from "@/components/JoinUsPopup";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Crown,
  Dumbbell,
  Layers3,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

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

async function getPricingPageData() {
  await seedDefaultPlansIfEmpty();

  const [settings, plans] = await Promise.all([
    prisma.systemSetting.findFirst(),
    prisma.membershipPlan.findMany({
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
    }),
  ]);

  return {
    brand: {
      gymName: settings?.gymName || "Dolphin Fitness Center",
      logoUrl: settings?.logoUrl || null,
      currency: settings?.currency || "LKR",
    },
    plans,
  };
}

export default async function PricingPage() {
  const { brand, plans } = await getPricingPageData();

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <PublicNavbar />

      <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="pointer-events-none fixed inset-0">
          <div className="animate-glow-pulse absolute left-[-30%] top-[-20%] h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl sm:left-[-12%] sm:h-[560px] sm:w-[560px]" />
          <div className="animate-float-slow absolute right-[-30%] top-[12%] h-[360px] w-[360px] rounded-full bg-zinc-500/20 blur-3xl sm:right-[-12%] sm:h-[560px] sm:w-[560px]" />
          <div className="animate-glow-pulse absolute bottom-[-24%] left-[5%] h-[380px] w-[380px] rounded-full bg-white/10 blur-3xl sm:left-[25%] sm:h-[620px] sm:w-[620px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:70px_70px] opacity-20" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl text-center">
            <div className="animate-float-medium mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-white text-black shadow-2xl sm:h-24 sm:w-24">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.gymName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Dumbbell size={40} />
              )}
            </div>

            <div className="mt-8 inline-flex max-w-full animate-slide-up items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-300 shadow-2xl backdrop-blur-xl sm:px-5 sm:text-sm sm:tracking-[0.25em]">
              <Sparkles size={16} className="shrink-0" />
              <span className="truncate">Dynamic Membership Pricing</span>
            </div>

            <h1 className="animate-slide-up mt-7 break-words text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl md:text-7xl">
              Choose your power level. Upgrade your fitness journey.
            </h1>

            <p className="animate-slide-up mx-auto mt-7 max-w-3xl break-words text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
              Explore admin-controlled membership plans with live pricing,
              personal training options, coach selection, and smart monthly
              billing rules.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <HeroStat
                icon={<Layers3 size={18} />}
                label="Plans"
                value={`${plans.length}`}
              />
              <HeroStat
                icon={<Zap size={18} />}
                label="Billing"
                value="Monthly"
              />
              <HeroStat
                icon={<Crown size={18} />}
                label="PT Plan"
                value="Diamond"
              />
            </div>
          </div>

          {plans.length === 0 ? (
            <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-center text-sm text-zinc-400 sm:mt-16 sm:p-8">
              No active membership plans available.
            </div>
          ) : (
            <div className="mt-12 grid items-stretch gap-6 sm:mt-16 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan, index) => {
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
                    className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[2rem] border p-5 shadow-2xl transition duration-500 sm:rounded-[2.2rem] sm:p-7 sm:hover:-translate-y-4 ${
                      highlighted
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/[0.06] text-white backdrop-blur-xl hover:bg-white/[0.09]"
                    }`}
                    style={{
                      animationDelay: `${index * 120}ms`,
                    }}
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                      <div
                        className={`absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl ${
                          highlighted ? "bg-black/20" : "bg-white/15"
                        }`}
                      />
                      <div
                        className={`absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl ${
                          highlighted ? "bg-zinc-500/20" : "bg-zinc-400/10"
                        }`}
                      />
                    </div>

                    <div className="relative z-10 flex h-full min-w-0 flex-col">
                      <div className="flex min-w-0 items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500 sm:tracking-[0.25em]">
                            Plan {index + 1}
                          </p>

                          <h2 className="mt-3 break-words text-xl font-black leading-tight sm:text-2xl">
                            {plan.name}
                          </h2>
                        </div>

                        <span
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition duration-500 group-hover:rotate-6 group-hover:scale-110 sm:h-13 sm:w-13 ${
                            highlighted
                              ? "bg-black text-white"
                              : "bg-white text-black"
                          }`}
                        >
                          {highlighted ? (
                            <Crown size={24} />
                          ) : (
                            <ShieldCheck size={24} />
                          )}
                        </span>
                      </div>

                      {highlighted && (
                        <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
                          <Star size={14} />
                          Premium Choice
                        </div>
                      )}

                      <p
                        className={`mt-5 break-words text-sm font-semibold leading-6 ${
                          highlighted ? "text-zinc-600" : "text-zinc-400"
                        }`}
                      >
                        {plan.description ||
                          "Monthly membership plan with gym access and member support."}
                      </p>

                      <div
                        className={`mt-7 rounded-[1.5rem] border p-5 ${
                          highlighted
                            ? "border-black/10 bg-black text-white"
                            : "border-white/10 bg-black text-white"
                        }`}
                      >
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500 sm:tracking-[0.25em]">
                          Monthly Fee
                        </p>

                        <p className="mt-2 break-words text-3xl font-black sm:text-4xl">
                          {brand.currency} {plan.monthlyFee.toLocaleString()}
                        </p>

                        <p className="mt-2 text-sm font-semibold text-zinc-500">
                          Per month
                        </p>
                      </div>

                      {plan.requiresCoach && (
                        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-center text-sm font-black text-white">
                          <Dumbbell size={16} className="shrink-0" />
                          Coach selection required
                        </div>
                      )}

                      <div className="mt-7 flex-1 space-y-3">
                        {features.slice(0, 6).map((item) => (
                          <div
                            key={item}
                            className="flex min-w-0 items-start gap-3"
                          >
                            <CheckCircle2
                              size={18}
                              className={`mt-0.5 shrink-0 ${
                                highlighted ? "text-black" : "text-white"
                              }`}
                            />
                            <span className="break-words text-sm font-semibold">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Link
                        href={`/register?plan=${plan.slug}`}
                        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black transition duration-300 hover:scale-[1.03] sm:text-base ${
                          highlighted
                            ? "bg-black text-white hover:bg-zinc-800"
                            : "bg-white text-black hover:bg-zinc-200"
                        }`}
                      >
                        Choose Plan <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <section className="mt-16 grid gap-6 lg:mt-20 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white p-5 text-black shadow-2xl transition duration-500 sm:p-8 sm:hover:-translate-y-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                <BadgeCheck size={26} />
              </div>

              <h2 className="mt-6 break-words text-3xl font-black tracking-tight sm:text-4xl">
                Built for one clear subscription per member.
              </h2>

              <p className="mt-4 break-words text-sm font-semibold leading-7 text-zinc-600">
                Members register with one selected plan. The system avoids
                duplicate active subscriptions and keeps billing simple for both
                the gym and the client.
              </p>

              <Link
                href="/register"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-4 text-sm font-black text-white transition hover:bg-zinc-800 sm:w-fit sm:text-base sm:hover:scale-[1.03]"
              >
                Start Membership <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Rule
                icon={<ShieldCheck size={20} />}
                title="One Active Plan"
                text="A member can keep only one current subscription."
              />
              <Rule
                icon={<CalendarIcon />}
                title="Next Cycle Changes"
                text="Plan changes are stored as pending and apply at renewal."
              />
              <Rule
                icon={<Crown size={20} />}
                title="Diamond Coaching"
                text="Diamond membership can require coach selection."
              />
              <Rule
                icon={<Zap size={20} />}
                title="Admin Controlled"
                text="Prices and plan names update from admin dashboard."
              />
            </div>
          </section>

          <section className="mt-16 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8 lg:mt-20 lg:rounded-[2.5rem]">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-10">
              <div className="min-w-0">
                <p className="break-words text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 sm:text-base sm:tracking-[0.3em]">
                  Why choose {brand.gymName}
                </p>

                <h2 className="mt-4 break-words text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                  A modern membership experience for modern fitness clients.
                </h2>

                <p className="mt-5 max-w-2xl break-words text-sm leading-6 text-zinc-400 sm:text-base">
                  From plan selection to due date tracking, payments, body
                  profiles, and personal training, everything is connected in
                  one digital gym system.
                </p>
              </div>

              <div className="rounded-[2rem] bg-black p-4 sm:p-6">
                <div className="grid gap-4">
                  <TimelineStep number="01" text="Choose a membership plan" />
                  <TimelineStep
                    number="02"
                    text="Register and record first payment"
                  />
                  <TimelineStep
                    number="03"
                    text="Track due dates and renew monthly"
                  />
                  <TimelineStep
                    number="04"
                    text="Upgrade plan from next billing cycle"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <PublicFooter />
      <JoinUsPopup />
    </main>
  );
}

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 text-left shadow-2xl backdrop-blur-xl transition duration-300 hover:bg-white/[0.1] sm:hover:-translate-y-1">
      <div className="flex items-center gap-2 text-zinc-400">{icon}</div>
      <p className="mt-3 break-words text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 break-words text-2xl font-black">{value}</p>
    </div>
  );
}

function Rule({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl transition duration-500 hover:bg-white hover:text-black sm:p-6 sm:hover:-translate-y-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black transition duration-500 group-hover:bg-black group-hover:text-white">
        {icon}
      </div>

      <h3 className="mt-5 break-words text-xl font-black">{title}</h3>

      <p className="mt-2 break-words text-sm font-semibold leading-6 text-zinc-500">
        {text}
      </p>
    </div>
  );
}

function TimelineStep({ number, text }: { number: string; text: string }) {
  return (
    <div className="group flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition duration-300 hover:bg-white hover:text-black sm:hover:translate-x-2">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-black transition group-hover:bg-black group-hover:text-white">
        {number}
      </span>
      <p className="break-words font-black">{text}</p>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}