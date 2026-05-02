"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CreditCard,
  Loader2,
  RefreshCcw,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";

type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "ONLINE";

type Payment = {
  id: string;
  amount: number;
  method: string;
  status: string;
  paidForMonth: string;
  paidAt: string;
  dueDate: string;
  note: string | null;
  member: {
    id: string;
    memberNo: string;
    age: number | null;
    profileImage: string | null;
    user: {
      name: string;
      email: string;
      phone: string;
    };
    subscription: {
      id: string;
      type: "NORMAL_MONTHLY" | "PERSONAL_TRAINING";
      totalMonthlyFee: number;
      nextDueDate: string;
      plan?: {
        name: string;
        monthlyFee: number;
      } | null;
      pendingPlan?: {
        name: string;
        monthlyFee: number;
      } | null;
      pendingPlanEffectiveDate: string | null;
      coach?: {
        name: string;
      } | null;
      pendingCoach?: {
        name: string;
      } | null;
    } | null;
  };
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [renewingMemberId, setRenewingMemberId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethod>>(
    {}
  );

  async function loadPayments() {
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();

      if (Array.isArray(data)) {
        setPayments(data);

        const initialMethods: Record<string, PaymentMethod> = {};

        data.forEach((payment: Payment) => {
          if (payment.member?.id) {
            initialMethods[payment.member.id] = "CASH";
          }
        });

        setPaymentMethods(initialMethods);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const q = search.toLowerCase();

    return (
      payment.member.user.name.toLowerCase().includes(q) ||
      payment.member.user.email.toLowerCase().includes(q) ||
      payment.member.user.phone.toLowerCase().includes(q) ||
      payment.member.memberNo.toLowerCase().includes(q) ||
      payment.method.toLowerCase().includes(q) ||
      payment.status.toLowerCase().includes(q) ||
      (payment.member.subscription?.plan?.name || "").toLowerCase().includes(q) ||
      (payment.member.subscription?.pendingPlan?.name || "")
        .toLowerCase()
        .includes(q)
    );
  });

  const latestPaymentByMember = useMemo(() => {
    const map = new Map<string, string>();

    payments.forEach((payment) => {
      const memberId = payment.member.id;
      const currentSavedPaymentId = map.get(memberId);

      if (!currentSavedPaymentId) {
        map.set(memberId, payment.id);
        return;
      }

      const currentSavedPayment = payments.find(
        (item) => item.id === currentSavedPaymentId
      );

      if (
        currentSavedPayment &&
        new Date(payment.paidAt).getTime() >
          new Date(currentSavedPayment.paidAt).getTime()
      ) {
        map.set(memberId, payment.id);
      }
    });

    return map;
  }, [payments]);

  const totalIncome = useMemo(() => {
    return payments.reduce((sum, payment) => {
      if (payment.status === "PAID") {
        return sum + payment.amount;
      }

      return sum;
    }, 0);
  }, [payments]);

  async function renewSubscription(memberId: string) {
    const confirmed = window.confirm(
      "Record next monthly payment for this member? If there is a pending plan change, it will apply only if the next billing date is reached."
    );

    if (!confirmed) return;

    setRenewingMemberId(memberId);
    setMessage("");

    try {
      const res = await fetch("/api/member/renew-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          paymentMethod: paymentMethods[memberId] || "CASH",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to renew subscription.");
        return;
      }

      setMessage(data.message || "Subscription renewed successfully.");
      await loadPayments();
    } catch {
      setMessage("Something went wrong while renewing subscription.");
    } finally {
      setRenewingMemberId("");
    }
  }

  function updatePaymentMethod(memberId: string, method: PaymentMethod) {
    setPaymentMethods((prev) => ({
      ...prev,
      [memberId]: method,
    }));
  }

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
          Admin Payments
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">
              Payment Records
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              View membership payments, renew monthly subscriptions, and apply
              pending plan changes only from the next billing cycle.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-black lg:min-w-[230px]">
            <p className="text-sm font-black text-zinc-500">Total Income</p>
            <p className="break-words text-2xl font-black sm:text-3xl">
              LKR {totalIncome.toLocaleString()}
            </p>
          </div>
        </div>
      </header>

      {message && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-sm font-bold text-zinc-200">
          {message}
        </div>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<WalletCards size={22} />}
          label="Total Payments"
          value={payments.length.toString()}
        />
        <SummaryCard
          icon={<CreditCard size={22} />}
          label="Paid Income"
          value={`LKR ${totalIncome.toLocaleString()}`}
        />
        <SummaryCard
          icon={<CalendarClock size={22} />}
          label="Latest Records"
          value="Live"
        />
      </section>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 sm:px-5">
        <Search size={20} className="shrink-0 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search payments..."
          className="w-full min-w-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600 sm:text-base"
        />
      </div>

      {loading ? (
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
          Loading payments...
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
          No payments found.
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 xl:hidden">
            {filteredPayments.map((payment) => {
              const subscription = payment.member.subscription;
              const isLatestPayment =
                latestPaymentByMember.get(payment.member.id) === payment.id;

              return (
                <MobilePaymentCard
                  key={payment.id}
                  payment={payment}
                  isLatestPayment={isLatestPayment}
                  paymentMethod={paymentMethods[payment.member.id] || "CASH"}
                  renewing={renewingMemberId === payment.member.id}
                  onMethodChange={(method) =>
                    updatePaymentMethod(payment.member.id, method)
                  }
                  onRenew={() => renewSubscription(payment.member.id)}
                  currentPlan={
                    subscription?.plan?.name ||
                    (subscription?.type === "PERSONAL_TRAINING"
                      ? "Personal Training"
                      : "Normal Monthly")
                  }
                />
              );
            })}
          </div>

          <div className="mt-8 hidden overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl xl:block">
            <table className="w-full min-w-[1200px] text-left text-sm">
              <thead className="bg-white text-black">
                <tr>
                  <th className="px-5 py-4">Member</th>
                  <th className="px-5 py-4">Current Plan</th>
                  <th className="px-5 py-4">Pending Change</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Method</th>
                  <th className="px-5 py-4">Paid Month</th>
                  <th className="px-5 py-4">Paid Date</th>
                  <th className="px-5 py-4">Next Due</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Renew</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment) => {
                  const subscription = payment.member.subscription;
                  const isLatestPayment =
                    latestPaymentByMember.get(payment.member.id) === payment.id;

                  return (
                    <tr
                      key={payment.id}
                      className="border-t border-white/10 transition hover:bg-white/[0.04]"
                    >
                      <td className="px-5 py-5">
                        <MemberCell payment={payment} />
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-black text-zinc-200">
                          {subscription?.plan?.name ||
                            (subscription?.type === "PERSONAL_TRAINING"
                              ? "Personal Training"
                              : "Normal Monthly")}
                        </p>

                        {subscription?.coach && (
                          <p className="mt-1 text-xs font-bold text-zinc-500">
                            Coach: {subscription.coach.name}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <PendingChange subscription={subscription} />
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

                      <td className="px-5 py-5 font-bold text-zinc-300">
                        {subscription?.nextDueDate
                          ? new Date(subscription.nextDueDate).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="px-5 py-5">
                        <StatusBadge status={payment.status} />
                      </td>

                      <td className="px-5 py-5">
                        {isLatestPayment ? (
                          <RenewControl
                            memberId={payment.member.id}
                            method={paymentMethods[payment.member.id] || "CASH"}
                            renewing={renewingMemberId === payment.member.id}
                            onMethodChange={(method) =>
                              updatePaymentMethod(payment.member.id, method)
                            }
                            onRenew={() => renewSubscription(payment.member.id)}
                          />
                        ) : (
                          <span className="text-xs font-bold text-zinc-600">
                            History
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function MemberCell({ payment }: { payment: Payment }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-white text-black">
        {payment.member.profileImage ? (
          <img
            src={payment.member.profileImage}
            alt={payment.member.user.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserRound size={20} />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate font-black">{payment.member.user.name}</p>
        <p className="truncate text-xs font-bold text-zinc-500">
          {payment.member.memberNo}
        </p>
      </div>
    </div>
  );
}

function PendingChange({
  subscription,
}: {
  subscription: Payment["member"]["subscription"];
}) {
  if (!subscription?.pendingPlan) {
    return (
      <span className="text-xs font-bold text-zinc-600">
        No pending change
      </span>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
      <p className="font-black text-white">{subscription.pendingPlan.name}</p>

      <p className="mt-1 text-xs font-bold text-zinc-500">
        Applies:{" "}
        {subscription.pendingPlanEffectiveDate
          ? new Date(subscription.pendingPlanEffectiveDate).toLocaleDateString()
          : "Next billing"}
      </p>

      {subscription.pendingCoach && (
        <p className="mt-1 text-xs font-bold text-zinc-500">
          Coach: {subscription.pendingCoach.name}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
      {status}
    </span>
  );
}

function RenewControl({
  method,
  renewing,
  onMethodChange,
  onRenew,
}: {
  memberId?: string;
  method: PaymentMethod;
  renewing: boolean;
  onMethodChange: (method: PaymentMethod) => void;
  onRenew: () => void;
}) {
  return (
    <div className="grid min-w-[190px] gap-2">
      <select
        value={method}
        onChange={(e) => onMethodChange(e.target.value as PaymentMethod)}
        className="rounded-full border border-white/10 bg-black px-3 py-2 text-xs font-black text-white outline-none"
      >
        <option value="CASH">Cash</option>
        <option value="CARD">Card</option>
        <option value="BANK_TRANSFER">Bank Transfer</option>
        <option value="ONLINE">Online</option>
      </select>

      <button
        type="button"
        onClick={onRenew}
        disabled={renewing}
        className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-black transition hover:scale-[1.02] disabled:opacity-60"
      >
        {renewing ? (
          <Loader2 className="animate-spin" size={15} />
        ) : (
          <RefreshCcw size={15} />
        )}
        Renew
      </button>
    </div>
  );
}

function MobilePaymentCard({
  payment,
  currentPlan,
  isLatestPayment,
  paymentMethod,
  renewing,
  onMethodChange,
  onRenew,
}: {
  payment: Payment;
  currentPlan: string;
  isLatestPayment: boolean;
  paymentMethod: PaymentMethod;
  renewing: boolean;
  onMethodChange: (method: PaymentMethod) => void;
  onRenew: () => void;
}) {
  const subscription = payment.member.subscription;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <MemberCell payment={payment} />
        <StatusBadge status={payment.status} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MobileDetail label="Current Plan" value={currentPlan} />
        <MobileDetail label="Amount" value={`LKR ${payment.amount.toLocaleString()}`} />
        <MobileDetail label="Method" value={payment.method} />
        <MobileDetail label="Paid Month" value={payment.paidForMonth} />
        <MobileDetail
          label="Paid Date"
          value={new Date(payment.paidAt).toLocaleDateString()}
        />
        <MobileDetail
          label="Next Due"
          value={
            subscription?.nextDueDate
              ? new Date(subscription.nextDueDate).toLocaleDateString()
              : "N/A"
          }
        />
      </div>

      <div className="mt-4">
        <PendingChange subscription={subscription} />
      </div>

      <div className="mt-5">
        {isLatestPayment ? (
          <RenewControl
            method={paymentMethod}
            renewing={renewing}
            onMethodChange={onMethodChange}
            onRenew={onRenew}
          />
        ) : (
          <span className="text-xs font-bold text-zinc-600">History</span>
        )}
      </div>
    </div>
  );
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-zinc-200">
        {value}
      </p>
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