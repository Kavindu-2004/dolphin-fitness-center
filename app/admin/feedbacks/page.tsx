"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  Search,
  Star,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";

type FeedbackStatus = "PENDING" | "APPROVED" | "REJECTED";

type Feedback = {
  id: string;
  rating: number;
  message: string;
  status: FeedbackStatus;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  member: {
    memberNo: string;
    profileImage: string | null;
    user: {
      name: string;
      email: string;
      phone: string;
    };
    subscription: {
      type: "NORMAL_MONTHLY" | "PERSONAL_TRAINING";
      status: string;
    } | null;
  };
};

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | FeedbackStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");

  async function loadFeedbacks() {
    try {
      const res = await fetch("/api/admin/feedbacks");
      const data = await res.json();

      if (Array.isArray(data)) {
        setFeedbacks(data);
      }
    } catch {
      setMessage("Failed to load feedbacks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const q = search.toLowerCase();

    const matchesSearch =
      feedback.member.user.name.toLowerCase().includes(q) ||
      feedback.member.user.email.toLowerCase().includes(q) ||
      feedback.member.user.phone.toLowerCase().includes(q) ||
      feedback.member.memberNo.toLowerCase().includes(q) ||
      feedback.message.toLowerCase().includes(q);

    const matchesFilter = filter === "ALL" || feedback.status === filter;

    return matchesSearch && matchesFilter;
  });

  const stats = useMemo(() => {
    return {
      total: feedbacks.length,
      pending: feedbacks.filter((item) => item.status === "PENDING").length,
      approved: feedbacks.filter((item) => item.status === "APPROVED").length,
      rejected: feedbacks.filter((item) => item.status === "REJECTED").length,
    };
  }, [feedbacks]);

  async function updateFeedbackStatus(
    feedbackId: string,
    action: "APPROVE" | "REJECT"
  ) {
    setUpdatingId(feedbackId);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/feedbacks/${feedbackId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to update feedback.");
        return;
      }

      setMessage(data.message || "Feedback updated successfully.");
      await loadFeedbacks();
    } catch {
      setMessage("Something went wrong while updating feedback.");
    } finally {
      setUpdatingId("");
    }
  }

  async function deleteFeedback(feedbackId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this feedback?"
    );

    if (!confirmed) return;

    setDeletingId(feedbackId);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/feedbacks/${feedbackId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete feedback.");
        return;
      }

      setMessage(data.message || "Feedback deleted successfully.");

      setFeedbacks((prev) =>
        prev.filter((feedback) => feedback.id !== feedbackId)
      );
    } catch {
      setMessage("Something went wrong while deleting feedback.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
          Admin Feedbacks
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">
              Client Feedback Approvals
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Review member feedback, approve testimonials for the website,
              reject unsuitable feedback, or delete feedback permanently.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-black lg:min-w-[200px]">
            <p className="text-sm font-black text-zinc-500">
              Pending Approval
            </p>
            <p className="text-3xl font-black">{stats.pending}</p>
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
          icon={<MessageCircle size={22} />}
          label="Total Feedbacks"
          value={stats.total.toString()}
        />
        <SummaryCard
          icon={<Clock size={22} />}
          label="Pending"
          value={stats.pending.toString()}
        />
        <SummaryCard
          icon={<CheckCircle2 size={22} />}
          label="Approved"
          value={stats.approved.toString()}
        />
        <SummaryCard
          icon={<XCircle size={22} />}
          label="Rejected"
          value={stats.rejected.toString()}
        />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 sm:px-5">
          <Search size={20} className="shrink-0 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedbacks..."
            className="w-full min-w-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600 sm:text-base"
          />
        </div>

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as "ALL" | FeedbackStatus)
          }
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 font-bold text-white outline-none"
        >
          <option className="bg-black" value="ALL">
            All Status
          </option>
          <option className="bg-black" value="PENDING">
            Pending
          </option>
          <option className="bg-black" value="APPROVED">
            Approved
          </option>
          <option className="bg-black" value="REJECTED">
            Rejected
          </option>
        </select>
      </div>

      {loading ? (
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
          Loading feedbacks...
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
          No feedbacks found.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {filteredFeedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              updating={updatingId === feedback.id}
              deleting={deletingId === feedback.id}
              onApprove={() => updateFeedbackStatus(feedback.id, "APPROVE")}
              onReject={() => updateFeedbackStatus(feedback.id, "REJECT")}
              onDelete={() => deleteFeedback(feedback.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackCard({
  feedback,
  updating,
  deleting,
  onApprove,
  onReject,
  onDelete,
}: {
  feedback: Feedback;
  updating: boolean;
  deleting: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  const plan =
    feedback.member.subscription?.type === "PERSONAL_TRAINING"
      ? "Personal Training"
      : "Normal Monthly";

  return (
    <div className="shine-effect min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/[0.09] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-3xl bg-white text-black sm:h-16 sm:w-16">
            {feedback.member.profileImage ? (
              <img
                src={feedback.member.profileImage}
                alt={feedback.member.user.name}
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
              {feedback.member.user.name}
            </h2>
            <p className="mt-1 truncate text-sm font-bold text-zinc-500">
              {feedback.member.memberNo} • {plan}
            </p>
          </div>
        </div>

        <StatusBadge status={feedback.status} />
      </div>

      <div className="mt-5 flex gap-1 text-white">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            fill={star <= feedback.rating ? "currentColor" : "none"}
            className={star <= feedback.rating ? "text-white" : "text-zinc-600"}
          />
        ))}
      </div>

      <p className="mt-5 break-words rounded-2xl border border-white/10 bg-black/30 p-5 text-sm font-semibold leading-7 text-zinc-300">
        “{feedback.message}”
      </p>

      <div className="mt-5 grid gap-3 text-sm font-bold text-zinc-500 md:grid-cols-2">
        <div className="break-words">
          Submitted: {new Date(feedback.createdAt).toLocaleDateString()}
        </div>
        <div className="break-words">Email: {feedback.member.user.email}</div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={onApprove}
          disabled={updating || deleting || feedback.status === "APPROVED"}
          className="shine-effect flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02] disabled:opacity-50"
        >
          {updating ? (
            <Loader2 className="animate-spin" size={17} />
          ) : (
            <CheckCircle2 size={17} />
          )}
          Approve
        </button>

        <button
          type="button"
          onClick={onReject}
          disabled={updating || deleting || feedback.status === "REJECTED"}
          className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-black/50 disabled:opacity-50"
        >
          {updating ? (
            <Loader2 className="animate-spin" size={17} />
          ) : (
            <XCircle size={17} />
          )}
          Reject
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={updating || deleting}
          className="flex items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-red-600 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="animate-spin" size={17} />
          ) : (
            <Trash2 size={17} />
          )}
          Delete
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const className =
    status === "APPROVED"
      ? "bg-white text-black"
      : status === "REJECTED"
      ? "bg-red-500 text-white"
      : "border border-white/10 bg-black text-white";

  return (
    <span
      className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-black ${className}`}
    >
      {status}
    </span>
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