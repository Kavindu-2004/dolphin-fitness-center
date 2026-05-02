import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  Dumbbell,
  Mail,
  Phone,
  Star,
  Trophy,
  UserRoundCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getCoaches() {
  const coaches = await prisma.coach.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  return coaches;
}

async function getBrandSettings() {
  const settings = await prisma.systemSetting.findFirst();

  return {
    gymName: settings?.gymName || "Dolphin Fitness Center",
  };
}

export default async function CoachesPage() {
  const coaches = await getCoaches();
  const brand = await getBrandSettings();

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <PublicNavbar />

      <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16">
        <div className="pointer-events-none fixed inset-0">
          <div className="animate-glow-pulse absolute left-[-30%] top-[-20%] h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl sm:left-[-10%] sm:h-[500px] sm:w-[500px]" />
          <div className="animate-float-slow absolute bottom-[-20%] right-[-30%] h-[360px] w-[360px] rounded-full bg-zinc-500/20 blur-3xl sm:right-[-10%] sm:h-[500px] sm:w-[500px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="animate-slide-up">
            <p className="break-words text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 sm:text-sm sm:tracking-[0.3em]">
              {brand.gymName}
            </p>

            <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
                  Choose Your Coach
                </h1>

                <p className="mt-5 max-w-2xl break-words text-sm leading-6 text-zinc-400 sm:text-lg sm:leading-8">
                  Personal training members can select a coach during
                  registration. Each coach can help members with strength,
                  weight loss, fitness discipline, and body transformation.
                </p>
              </div>

              <Link
                href="/register"
                className="shine-effect inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-black text-black transition hover:bg-zinc-200 sm:w-fit sm:text-base sm:hover:scale-[1.02]"
              >
                Start Membership <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {coaches.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-sm text-zinc-400 sm:p-8">
              No coaches found. Add coaches from the admin coaches page.
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:mt-12 md:grid-cols-2 xl:grid-cols-3">
              {coaches.map((coach, index) => (
                <div
                  key={coach.id}
                  className="shine-effect group min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur transition duration-300 hover:bg-white/10 sm:hover:-translate-y-3"
                  style={{ animationDelay: `${index * 0.12}s` }}
                >
                  <div className="relative h-64 overflow-hidden bg-black sm:h-80">
                    {coach.image ? (
                      <img
                        src={coach.image}
                        alt={coach.name}
                        className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white text-black">
                        <Dumbbell size={64} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute bottom-5 left-5 right-5 min-w-0">
                      <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-black sm:text-sm">
                        <Star size={16} className="shrink-0" />
                        <span className="truncate">{coach.experience}</span>
                      </div>

                      <h2 className="mt-4 break-words text-2xl font-black sm:text-3xl">
                        {coach.name}
                      </h2>

                      <p className="mt-1 break-words text-sm font-bold text-zinc-300">
                        {coach.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 p-5 sm:p-7">
                    <p className="break-words text-sm leading-6 text-zinc-400">
                      {coach.description ||
                        "Available for personal training, member guidance, and fitness progress support."}
                    </p>

                    <div className="mt-6 space-y-3">
                      <InfoRow icon={<Phone size={18} />} text={coach.phone} />

                      {coach.email && (
                        <InfoRow icon={<Mail size={18} />} text={coach.email} />
                      )}

                      <InfoRow
                        icon={<Trophy size={18} />}
                        text="Available for personal training"
                      />

                      <InfoRow
                        icon={<UserRoundCheck size={18} />}
                        text="Can be selected during registration"
                      />
                    </div>

                    <Link
                      href="/register"
                      className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200 sm:hover:scale-[1.02]"
                    >
                      Choose This Coach
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-bold text-zinc-300">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 truncate">{text}</span>
    </div>
  );
}