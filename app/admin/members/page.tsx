"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  CalendarClock,
  Crown,
  Dumbbell,
  Mail,
  MapPin,
  Phone,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";

type Member = {
  id: string;
  memberNo: string;
  age: number | null;
  address: string | null;
  profileImage: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    phone: string;
  };
  subscription: {
    id: string;
    type: "NORMAL_MONTHLY" | "PERSONAL_TRAINING";
    status: string;
    totalMonthlyFee: number;
    nextDueDate: string;

    plan?: {
      id: string;
      name: string;
      slug: string;
      monthlyFee: number;
      requiresCoach: boolean;
      isPersonalTraining: boolean;
    } | null;

    pendingPlan?: {
      id: string;
      name: string;
      slug: string;
      monthlyFee: number;
      requiresCoach: boolean;
      isPersonalTraining: boolean;
    } | null;

    pendingPlanEffectiveDate: string | null;

    coach?: {
      name: string;
      specialty: string;
    } | null;

    pendingCoach?: {
      name: string;
      specialty: string;
    } | null;
  } | null;
  payments: {
    amount: number;
    method: string;
    status: string;
    paidAt: string;
  }[];
  bodyProfiles: {
    heightCm: number | null;
    weightKg: number | null;
    bmi: number | null;
    measuredAt: string;
  }[];
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await fetch("/api/admin/members");
        const data = await res.json();

        if (Array.isArray(data)) {
          setMembers(data);
        }
      } catch (error) {
        console.error("LOAD_MEMBERS_ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  const filteredMembers = members.filter((member) => {
    const q = search.toLowerCase();

    return (
      member.user.name.toLowerCase().includes(q) ||
      member.user.firstName.toLowerCase().includes(q) ||
      member.user.lastName.toLowerCase().includes(q) ||
      member.user.email.toLowerCase().includes(q) ||
      member.user.phone.toLowerCase().includes(q) ||
      member.memberNo.toLowerCase().includes(q) ||
      (member.subscription?.plan?.name || "").toLowerCase().includes(q) ||
      (member.subscription?.pendingPlan?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
          Admin Members
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">
              Registered Clients
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              View client details, current membership plan, pending subscription
              changes, payment status, coaches, and body profile summary.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-black lg:min-w-[190px]">
            <p className="text-sm font-black text-zinc-500">Total Members</p>
            <p className="text-3xl font-black">{members.length}</p>
          </div>
        </div>
      </header>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 sm:px-5">
        <Search size={20} className="shrink-0 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full min-w-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600 sm:text-base"
        />
      </div>

      {loading ? (
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
          Loading members...
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
          No members found.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {filteredMembers.map((member) => (
            <Link
              key={member.id}
              href={`/admin/members/${member.id}`}
              className="block min-w-0"
            >
              <MemberCard member={member} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: Member }) {
  const currentPlan =
    member.subscription?.plan?.name ||
    (member.subscription?.type === "PERSONAL_TRAINING"
      ? "Personal Training"
      : "Normal Monthly");

  const pendingPlan = member.subscription?.pendingPlan;
  const latestPayment = member.payments[0];
  const latestBody = member.bodyProfiles[0];

  return (
    <div className="shine-effect min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/[0.09] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-3xl bg-white text-black sm:h-16 sm:w-16">
            {member.profileImage ? (
              <img
                src={member.profileImage}
                alt={member.user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <UserRound size={28} />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-xl font-black sm:text-2xl">
              {member.user.name}
            </h2>
            <p className="mt-1 truncate text-xs font-bold text-zinc-500 sm:text-sm">
              {member.memberNo} • Age {member.age || "N/A"}
            </p>
          </div>
        </div>

        <span className="w-fit shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-black">
          {member.subscription?.status || "NO PLAN"}
        </span>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Info icon={<Mail size={17} />} text={member.user.email} />
        <Info icon={<Phone size={17} />} text={member.user.phone} />
        <Info
          icon={<MapPin size={17} />}
          text={member.address || "No address"}
        />
        <Info
          icon={<CalendarClock size={17} />}
          text={
            member.subscription?.nextDueDate
              ? `Due: ${new Date(
                  member.subscription.nextDueDate
                ).toLocaleDateString()}`
              : "No due date"
          }
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <MiniBox
          icon={<Dumbbell size={18} />}
          label="Current Plan"
          value={currentPlan}
        />

        <MiniBox
          icon={<WalletCards size={18} />}
          label="Monthly Fee"
          value={`LKR ${(
            member.subscription?.totalMonthlyFee || 0
          ).toLocaleString()}`}
        />

        <MiniBox
          icon={<Activity size={18} />}
          label="BMI"
          value={latestBody?.bmi ? String(latestBody.bmi) : "Not updated"}
        />
      </div>

      {pendingPlan && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white p-4 text-black">
          <div className="flex items-center gap-2">
            <Crown size={18} className="shrink-0" />
            <p className="text-sm font-black text-zinc-600">
              Pending Subscription Change
            </p>
          </div>

          <p className="mt-2 break-words text-lg font-black">
            {pendingPlan.name}
          </p>

          <p className="mt-1 text-sm font-semibold text-zinc-600">
            Applies from:{" "}
            {member.subscription?.pendingPlanEffectiveDate
              ? new Date(
                  member.subscription.pendingPlanEffectiveDate
                ).toLocaleDateString()
              : "Next billing cycle"}
          </p>

          {member.subscription?.pendingCoach && (
            <p className="mt-1 text-sm font-semibold text-zinc-600">
              Pending coach: {member.subscription.pendingCoach.name}
            </p>
          )}
        </div>
      )}

      {member.subscription?.coach && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm font-black text-zinc-400">Assigned Coach</p>
          <p className="mt-1 break-words font-black">
            {member.subscription.coach.name} —{" "}
            <span className="text-zinc-400">
              {member.subscription.coach.specialty}
            </span>
          </p>
        </div>
      )}

      {latestPayment && (
        <div className="mt-5 rounded-2xl bg-white p-4 text-black">
          <p className="text-sm font-black text-zinc-500">Latest Payment</p>
          <p className="mt-1 break-words font-black">
            LKR {latestPayment.amount.toLocaleString()} •{" "}
            {latestPayment.method} • {latestPayment.status}
          </p>
        </div>
      )}

      <p className="mt-5 text-sm font-black text-zinc-500">
        Click to view full member profile →
      </p>
    </div>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-zinc-300">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 truncate">{text}</span>
    </div>
  );
}

function MiniBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center gap-2 text-zinc-400">{icon}</div>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-600">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black">{value}</p>
    </div>
  );
}