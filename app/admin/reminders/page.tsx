"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  CalendarClock,
  Copy,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Send,
  UserRound,
  WalletCards,
} from "lucide-react";

type ReminderMember = {
  id: string;
  memberNo: string;
  age: number | null;
  address: string | null;
  profileImage: string | null;
  name: string;
  email: string;
  phone: string;
  subscriptionType: "NORMAL_MONTHLY" | "PERSONAL_TRAINING";
  subscriptionStatus: string;
  totalMonthlyFee: number;
  nextDueDate: string;
  daysLeft: number;
  reminderStatus: string;
  latestReminder: {
    type: string;
    status: string;
    sentAt: string | null;
    dueDate: string;
    message?: string;
  } | null;
  coach: {
    name: string;
    specialty: string;
  } | null;
};

export default function AdminRemindersPage() {
  const [members, setMembers] = useState<ReminderMember[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadReminders() {
    try {
      const res = await fetch("/api/admin/reminders");
      const data = await res.json();

      if (Array.isArray(data)) {
        setMembers(data);
      }
    } catch (error) {
      console.error("LOAD_REMINDERS_ERROR:", error);
      setMessage("Failed to load reminders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReminders();
  }, []);

  const filteredMembers = members.filter((member) => {
    const q = search.toLowerCase();

    const matchesSearch =
      member.name.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q) ||
      member.phone.toLowerCase().includes(q) ||
      member.memberNo.toLowerCase().includes(q);

    const matchesFilter =
      filter === "ALL" ||
      member.reminderStatus.toUpperCase().replace(" ", "_") === filter;

    return matchesSearch && matchesFilter;
  });

  const dueSoonCount = useMemo(() => {
    return members.filter(
      (member) =>
        member.reminderStatus === "Due Soon" ||
        member.reminderStatus === "Due Today"
    ).length;
  }, [members]);

  const overdueCount = useMemo(() => {
    return members.filter((member) => member.reminderStatus === "Overdue")
      .length;
  }, [members]);

  const sentCount = useMemo(() => {
    return members.filter((member) => member.latestReminder?.status === "SENT")
      .length;
  }, [members]);

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
          Admin Reminders
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">
              Payment Reminders
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Track upcoming monthly payment due dates, expired members, and
              record email, SMS, or WhatsApp reminder actions.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-black lg:min-w-[180px]">
            <p className="text-sm font-black text-zinc-500">Due Soon</p>
            <p className="text-3xl font-black">{dueSoonCount}</p>
          </div>
        </div>
      </header>

      {message && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-sm font-bold text-zinc-200">
          {message}
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<BellRing size={22} />}
          label="Reminder List"
          value={members.length.toString()}
        />
        <SummaryCard
          icon={<CalendarClock size={22} />}
          label="Due Soon / Today"
          value={dueSoonCount.toString()}
        />
        <SummaryCard
          icon={<WalletCards size={22} />}
          label="Overdue"
          value={overdueCount.toString()}
        />
        <SummaryCard
          icon={<Send size={22} />}
          label="Recorded Sent"
          value={sentCount.toString()}
        />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 sm:px-5">
          <Search size={20} className="shrink-0 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reminders..."
            className="w-full min-w-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600 sm:text-base"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 font-bold text-white outline-none"
        >
          <option className="bg-black" value="ALL">
            All Status
          </option>
          <option className="bg-black" value="OVERDUE">
            Overdue
          </option>
          <option className="bg-black" value="DUE_TODAY">
            Due Today
          </option>
          <option className="bg-black" value="DUE_SOON">
            Due Soon
          </option>
          <option className="bg-black" value="NOT_URGENT">
            Not Urgent
          </option>
        </select>
      </div>

      {loading ? (
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
          Loading reminders...
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
          No reminder records found.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {filteredMembers.map((member) => (
            <ReminderCard
              key={member.id}
              member={member}
              onRefresh={loadReminders}
              setMessage={setMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReminderCard({
  member,
  onRefresh,
  setMessage,
}: {
  member: ReminderMember;
  onRefresh: () => Promise<void>;
  setMessage: (message: string) => void;
}) {
  const [savingType, setSavingType] = useState("");

  const plan =
    member.subscriptionType === "PERSONAL_TRAINING"
      ? "Personal Training"
      : "Normal Monthly";

  const reminderMessage = `Dear ${
    member.name
  }, your Dolphin Fitness Center monthly payment of LKR ${member.totalMonthlyFee.toLocaleString()} is due on ${new Date(
    member.nextDueDate
  ).toLocaleDateString()}. Please complete your payment to keep your membership active.`;

  const cleanPhone = member.phone.replace(/[^\d]/g, "");
  const whatsappPhone = cleanPhone.startsWith("94")
    ? cleanPhone
    : cleanPhone.startsWith("0")
    ? `94${cleanPhone.slice(1)}`
    : cleanPhone;

  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    reminderMessage
  )}`;

  async function recordReminder(type: "EMAIL" | "SMS" | "WHATSAPP") {
    setSavingType(type);
    setMessage("");

    try {
      const res = await fetch("/api/admin/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: member.id,
          type,
          message: reminderMessage,
          dueDate: member.nextDueDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to record reminder.");
        return;
      }

      setMessage(`${type} reminder recorded successfully.`);
      await onRefresh();
    } catch {
      setMessage("Something went wrong while recording reminder.");
    } finally {
      setSavingType("");
    }
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(reminderMessage);
      setMessage("Reminder message copied.");
    } catch {
      setMessage("Could not copy message.");
    }
  }

  return (
    <div className="shine-effect min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/[0.09] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-3xl bg-white text-black sm:h-16 sm:w-16">
            {member.profileImage ? (
              <img
                src={member.profileImage}
                alt={member.name}
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
              {member.name}
            </h2>
            <p className="mt-1 truncate text-sm font-bold text-zinc-500">
              {member.memberNo} • {plan}
            </p>
          </div>
        </div>

        <StatusBadge status={member.reminderStatus} />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Info icon={<Mail size={17} />} text={member.email} />
        <Info icon={<Phone size={17} />} text={member.phone} />
        <Info
          icon={<WalletCards size={17} />}
          text={`LKR ${member.totalMonthlyFee.toLocaleString()}`}
        />
        <Info
          icon={<CalendarClock size={17} />}
          text={`Due: ${new Date(member.nextDueDate).toLocaleDateString()}`}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm font-black text-zinc-400">Due Status</p>
        <p className="mt-1 break-words text-sm font-bold text-zinc-300">
          {member.daysLeft < 0
            ? `${Math.abs(member.daysLeft)} day(s) overdue`
            : member.daysLeft === 0
            ? "Due today"
            : `${member.daysLeft} day(s) remaining`}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm font-black text-zinc-400">Reminder Message</p>
        <p className="mt-2 break-words text-sm leading-6 text-zinc-300">
          {reminderMessage}
        </p>
      </div>

      {member.latestReminder && (
        <div className="mt-5 rounded-2xl bg-white p-4 text-black">
          <p className="text-sm font-black text-zinc-500">Latest Reminder</p>
          <p className="mt-1 break-words text-sm font-black">
            {member.latestReminder.type} • {member.latestReminder.status} •{" "}
            {member.latestReminder.sentAt
              ? new Date(member.latestReminder.sentAt).toLocaleString()
              : "Not sent"}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => recordReminder("EMAIL")}
          disabled={savingType !== ""}
          className="shine-effect flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02] disabled:opacity-60"
        >
          {savingType === "EMAIL" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Mail size={16} />
          )}
          Record Email
        </button>

        <button
          onClick={() => recordReminder("SMS")}
          disabled={savingType !== ""}
          className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-black/50 disabled:opacity-60"
        >
          {savingType === "SMS" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Phone size={16} />
          )}
          Record SMS
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => recordReminder("WHATSAPP")}
          className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-black/50"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>

        <button
          onClick={copyMessage}
          className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-black/50"
        >
          <Copy size={16} />
          Copy Message
        </button>
      </div>

      <p className="mt-4 text-xs font-bold leading-5 text-zinc-600">
        Email/SMS buttons record the reminder action. WhatsApp opens the message
        in WhatsApp and records it.
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "Overdue"
      ? "bg-red-500 text-white"
      : status === "Due Today"
      ? "bg-white text-black"
      : status === "Due Soon"
      ? "bg-zinc-300 text-black"
      : "bg-black text-white border border-white/10";

  return (
    <span
      className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-black ${className}`}
    >
      {status}
    </span>
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