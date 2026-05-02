import PublicFooter from "@/components/PublicFooter";
import PublicNavbar from "@/components/PublicNavbar";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  ArrowRight,
  Dumbbell,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStorySettings() {
  const settings = await prisma.systemSetting.findFirst();

  return {
    gymName: settings?.gymName || "Dolphin Fitness Center",
    logoUrl: settings?.logoUrl || null,
  };
}

const storyCards = [
  {
    title: "Built for Real Progress",
    text: "Our goal is to create a gym environment where every member can train consistently, track their journey, and improve step by step.",
    icon: Target,
  },
  {
    title: "Coaching With Care",
    text: "Personal training members can work with experienced coaches who guide strength, cardio, weight loss, and body transformation goals.",
    icon: Users,
  },
  {
    title: "Smarter Memberships",
    text: "The gym uses a modern membership system to manage monthly payments, due dates, profile details, and body progress records.",
    icon: WalletCards,
  },
];

const photoCards = [
  {
    title: "Training Floor",
    text: "A focused space for strength, endurance, and daily discipline.",
    image: "/images/gym-story-1.jpg",
  },
  {
    title: "Personal Coaching",
    text: "Guided training support for members who need extra motivation.",
    image: "/images/gym-story-2.jpg",
  },
  {
    title: "Member Journey",
    text: "Every member profile, payment, and progress record stays organized.",
    image: "/images/gym-story-3.jpg",
  },
];

const timeline = [
  {
    year: "Step 01",
    title: "A Simple Fitness Vision",
    text: "Dolphin Fitness Center started with a clear idea: help people become stronger, healthier, and more confident through consistent training.",
  },
  {
    year: "Step 02",
    title: "Personal Training Support",
    text: "The gym introduced personal coaching to support members who wanted more structured guidance and a better transformation plan.",
  },
  {
    year: "Step 03",
    title: "Digital Membership System",
    text: "Now the gym uses a modern online system for member registration, payments, reminders, coach selection, and body profile tracking.",
  },
];

export default async function OurStoryPage() {
  const brand = await getStorySettings();

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <PublicNavbar />

      <section className="relative px-6 py-16">
        <div className="pointer-events-none fixed inset-0">
          <div className="animate-glow-pulse absolute left-[-10%] top-[-20%] h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
          <div className="animate-float-slow absolute right-[-10%] bottom-[-20%] h-[520px] w-[520px] rounded-full bg-zinc-500/20 blur-3xl" />
          <div className="animate-glow-pulse absolute bottom-[-20%] left-[30%] h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-zinc-300 shadow-2xl backdrop-blur transition duration-300 hover:scale-105 hover:bg-white/10">
                <Sparkles size={16} />
                Our Story
              </div>

              <h1 className="mt-8 max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
                More than a gym. A place to build discipline.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
                {brand.gymName} was created to help members train with purpose,
                stay consistent, and manage their fitness journey in a smarter
                way. From monthly memberships to personal coaching and body
                profile tracking, everything is built around progress.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="shine-effect inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-black text-black transition duration-300 hover:scale-105 hover:bg-zinc-200"
                >
                  Start Membership <ArrowRight size={18} />
                </Link>

                <Link
                  href="/coaches"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 font-black text-white backdrop-blur transition duration-300 hover:scale-105 hover:bg-white/10"
                >
                  Meet Coaches
                </Link>
              </div>
            </div>

            <div className="animate-slide-left relative">
              <div className="animate-glow-pulse absolute -inset-6 rounded-[3rem] bg-white/10 blur-3xl" />

              <div className="animate-float-medium relative rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:scale-[1.01]">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                  <div className="relative h-[430px]">
                    <img
                      src="/images/gym-story-main.jpg"
                      alt={`${brand.gymName} gym story`}
                      className="h-full w-full object-cover opacity-80 transition duration-700 hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-white text-black">
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.gymName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Dumbbell size={30} />
                        )}
                      </div>

                      <h2 className="mt-5 text-3xl font-black">
                        {brand.gymName}
                      </h2>

                      <p className="mt-2 text-sm font-semibold leading-6 text-zinc-300">
                        A modern fitness center focused on training,
                        membership management, and member progress.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-16 grid gap-6 md:grid-cols-3">
            {storyCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="group rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/[0.09]"
                  style={{ animationDelay: `${index * 0.12}s` }}
                >
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-black transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <Icon size={24} />
                  </div>

                  <h2 className="mt-6 text-2xl font-black">{card.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {card.text}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="mt-16 rounded-[2rem] border border-white/10 bg-white p-8 text-black shadow-2xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-black text-white">
                  <HeartPulse size={30} />
                </div>

                <h2 className="mt-6 text-4xl font-black">
                  Why we built this gym experience
                </h2>

                <p className="mt-4 text-sm font-semibold leading-7 text-zinc-600">
                  Many members join a gym with strong motivation, but staying
                  consistent is the real challenge. Our story is about building
                  a supportive place where training, payments, reminders,
                  coaching, and body progress are organized clearly.
                </p>

                <p className="mt-4 text-sm font-semibold leading-7 text-zinc-600">
                  With our digital system, members can view their profile,
                  check payment history, understand their subscription, and
                  follow their progress. Admins can manage the gym more
                  professionally and help members stay active.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <WhiteStat value="3" label="Expert coaches" />
                <WhiteStat value="100%" label="Monthly tracking" />
                <WhiteStat value="24/7" label="Profile access" />
                <WhiteStat value="Smart" label="Payment records" />
              </div>
            </div>
          </section>

          <section className="mt-16">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-bold uppercase tracking-[0.3em] text-zinc-500">
                  Photo Gallery
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  Moments from the gym
                </h2>
              </div>

              <p className="max-w-xl text-zinc-400">
                Replace these sample images with your real gym photos. Keep the
                same file names or change the image paths in the code.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {photoCards.map((card) => (
                <div
                  key={card.title}
                  className="shine-effect group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/10"
                >
                  <div className="h-72 overflow-hidden bg-black">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-black">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {card.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-bold uppercase tracking-[0.3em] text-zinc-500">
                  Our Journey
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  From fitness vision to digital gym system
                </h2>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-black">
                <Trophy size={30} />
              </div>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {timeline.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-white/10 bg-black/30 p-6 transition duration-300 hover:-translate-y-1 hover:bg-black/50"
                >
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-zinc-600">
                    {item.year}
                  </p>

                  <h3 className="mt-4 text-2xl font-black">{item.title}</h3>

                  <p className="mt-3 text-sm font-semibold leading-6 text-zinc-500">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 grid gap-6 md:grid-cols-3">
            <ValueCard
              icon={<ShieldCheck />}
              title="Trust"
              text="Members can depend on clear subscription, payment, and profile records."
            />
            <ValueCard
              icon={<Activity />}
              title="Progress"
              text="Body profile tracking helps members understand their transformation."
            />
            <ValueCard
              icon={<Dumbbell />}
              title="Discipline"
              text="Consistent training and coaching support create long-term results."
            />
          </section>

          <section className="mt-16 rounded-[2rem] border border-white/10 bg-white p-8 text-black shadow-2xl">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-4xl font-black">
                  Ready to become part of our story?
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-zinc-600">
                  Register online, choose your plan, select a personal trainer
                  if needed, and start your fitness journey with {brand.gymName}.
                </p>
              </div>

              <Link
                href="/register"
                className="shine-effect inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-4 font-black text-white transition hover:scale-[1.02]"
              >
                Join Now <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function WhiteStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-zinc-100 p-6 transition duration-300 hover:-translate-y-1 hover:bg-zinc-200">
      <p className="text-4xl font-black">{value}</p>
      <p className="mt-2 text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/[0.09]">
      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-black transition duration-300 group-hover:rotate-6 group-hover:scale-110">
        {icon}
      </div>

      <h2 className="mt-6 text-2xl font-black">{title}</h2>
      <p className="mt-3 text-sm font-semibold leading-6 text-zinc-500">
        {text}
      </p>
    </div>
  );
}