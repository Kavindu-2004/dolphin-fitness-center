"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  Crown,
  Dumbbell,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

type Coach = {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  experience: string;
};

type MembershipPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthlyFee: number;
  features: string | null;
  isActive: boolean;
  isPersonalTraining: boolean;
  requiresCoach: boolean;
  priority: number;
};

type PublicSettings = {
  gymName: string;
  monthlyFee: number;
  personalTrainingFee: number;
  personalTrainingTotal: number;
  currency: string;
  reminderDaysBefore: number;
};

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
    monthlyFee: number;
    personalTrainingFee: number;
    totalMonthlyFee: number;
    startDate: string;
    nextDueDate: string;
    lastPaidDate: string | null;

    plan?: MembershipPlan | null;
    pendingPlan?: MembershipPlan | null;
    pendingPlanEffectiveDate: string | null;
    pendingPlanRequestedAt?: string | null;
    changeNote?: string | null;

    coach?: {
      id?: string;
      name: string;
      phone: string;
      specialty: string;
      experience: string;
    } | null;

    pendingCoach?: {
      id?: string;
      name: string;
      phone: string;
      specialty: string;
      experience: string;
    } | null;
  } | null;
  payments: {
    id: string;
    amount: number;
    method: string;
    status: string;
    paidForMonth: string;
    paidAt: string;
    dueDate: string;
    note: string | null;
  }[];
  bodyProfiles: {
    id: string;
    heightCm: number | null;
    weightKg: number | null;
    bmi: number | null;
    chest: number | null;
    waist: number | null;
    hip: number | null;
    biceps: number | null;
    thigh: number | null;
    bodyFat: number | null;
    notes: string | null;
    measuredAt: string;
  }[];
};

export default function MemberDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);

  const [settings, setSettings] = useState<PublicSettings>({
    gymName: "Dolphin Fitness Center",
    monthlyFee: 3500,
    personalTrainingFee: 15000,
    personalTrainingTotal: 18500,
    currency: "LKR",
    reminderDaysBefore: 3,
  });

  const [loading, setLoading] = useState(true);

  const [changingSubscription, setChangingSubscription] = useState(false);
  const [savingSubscription, setSavingSubscription] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");

  const [recordingPayment, setRecordingPayment] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const [subscriptionForm, setSubscriptionForm] = useState({
    planId: "",
    coachId: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "CASH",
  });

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    }

    loadParams();
  }, [params]);

  async function loadMemberData(memberId: string) {
    try {
      const [memberRes, coachesRes, settingsRes, plansRes] = await Promise.all([
        fetch(`/api/admin/members/${memberId}`),
        fetch("/api/coaches"),
        fetch("/api/settings"),
        fetch("/api/public/membership-plans"),
      ]);

      const memberData = await memberRes.json();
      const coachesData = await coachesRes.json();
      const settingsData = await settingsRes.json();
      const plansData = await plansRes.json();

      if (memberRes.ok) {
        setMember(memberData);

        setSubscriptionForm({
          planId:
            memberData.subscription?.pendingPlan?.id ||
            memberData.subscription?.plan?.id ||
            "",
          coachId:
            memberData.subscription?.pendingCoach?.id ||
            memberData.subscription?.coach?.id ||
            "",
        });
      }

      if (Array.isArray(coachesData)) {
        setCoaches(coachesData);
      }

      if (settingsRes.ok) {
        setSettings(settingsData);
      }

      if (Array.isArray(plansData)) {
        setPlans(plansData);
      }
    } catch (error) {
      console.error("LOAD_MEMBER_DATA_ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    loadMemberData(id);
  }, [id]);

  const selectedPlan = plans.find((plan) => plan.id === subscriptionForm.planId);

  const selectedChangeTotal = useMemo(() => {
    return selectedPlan?.monthlyFee || 0;
  }, [selectedPlan]);

  function updateSubscriptionField(name: string, value: string) {
    setSubscriptionForm((prev) => {
      const nextForm = {
        ...prev,
        [name]: value,
      };

      if (name === "planId") {
        const plan = plans.find((item) => item.id === value);

        if (!plan?.requiresCoach) {
          nextForm.coachId = "";
        }
      }

      return nextForm;
    });
  }

  async function saveSubscriptionChange(e: React.FormEvent) {
    e.preventDefault();

    if (!member) return;

    setSavingSubscription(true);
    setSubscriptionMessage("");

    try {
      if (!selectedPlan) {
        setSubscriptionMessage("Please select a membership plan.");
        return;
      }

      if (selectedPlan.requiresCoach && !subscriptionForm.coachId) {
        setSubscriptionMessage(`Please select a coach for ${selectedPlan.name}.`);
        return;
      }

      const res = await fetch("/api/member/change-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: member.id,
          planId: subscriptionForm.planId,
          coachId: subscriptionForm.coachId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubscriptionMessage(
          data.message || "Failed to request subscription change."
        );
        return;
      }

      await loadMemberData(member.id);
      setChangingSubscription(false);
      setSubscriptionMessage(
        "Subscription change saved. New plan will apply from the next billing cycle."
      );
    } catch {
      setSubscriptionMessage("Something went wrong.");
    } finally {
      setSavingSubscription(false);
    }
  }

  async function recordMonthlyPayment(e: React.FormEvent) {
    e.preventDefault();

    if (!member) return;

    setSavingPayment(true);
    setPaymentMessage("");

    try {
      const res = await fetch("/api/member/renew-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: member.id,
          paymentMethod: paymentForm.paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPaymentMessage(data.message || "Failed to record payment.");
        return;
      }

      await loadMemberData(member.id);
      setRecordingPayment(false);
      setPaymentMessage(data.message || "Monthly payment recorded successfully.");
    } catch {
      setPaymentMessage("Something went wrong.");
    } finally {
      setSavingPayment(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
        Loading member profile...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
        Member not found.
      </div>
    );
  }

  const latestBody = member.bodyProfiles[0];

  const currentPlanName =
    member.subscription?.plan?.name ||
    (member.subscription?.type === "PERSONAL_TRAINING"
      ? "Personal Training"
      : "Normal Monthly");

  const renewalAmount =
    member.subscription?.pendingPlan?.monthlyFee ||
    member.subscription?.totalMonthlyFee ||
    0;

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <Link
        href="/admin/members"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Members
      </Link>

      <header className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[1.5rem] bg-white text-black">
              {member.profileImage ? (
                <img
                  src={member.profileImage}
                  alt={member.user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserRound size={38} />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500 sm:text-sm">
                {member.memberNo}
              </p>
              <h1 className="mt-2 break-words text-3xl font-black tracking-tight sm:text-5xl">
                {member.user.name}
              </h1>
              <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                Age {member.age || "N/A"} • Joined{" "}
                {new Date(member.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <span className="w-fit shrink-0 rounded-full bg-white px-4 py-2 text-sm font-black text-black">
            {member.subscription?.status || "NO PLAN"}
          </span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Info
            icon={<Mail size={18} />}
            label="Email"
            value={member.user.email}
          />
          <Info
            icon={<Phone size={18} />}
            label="Phone"
            value={member.user.phone}
          />
          <Info
            icon={<MapPin size={18} />}
            label="Address"
            value={member.address || "No address"}
          />
        </div>
      </header>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="min-w-0">
            <h2 className="text-xl font-black sm:text-2xl">
              Change Subscription for Next Billing Cycle
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-zinc-500">
              This will not charge immediately. The selected plan will become
              active when the next monthly payment is recorded.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setChangingSubscription((prev) => !prev)}
            className="w-full rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02] sm:w-fit"
          >
            {changingSubscription ? "Cancel Change" : "Request Plan Change"}
          </button>
        </div>

        {subscriptionMessage && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-bold text-zinc-300">
            {subscriptionMessage}
          </div>
        )}

        {member.subscription?.pendingPlan && (
          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white p-5 text-black">
            <div className="flex items-center gap-2">
              <Crown size={18} className="shrink-0" />
              <p className="text-sm font-black text-zinc-600">
                Pending Plan Change
              </p>
            </div>

            <p className="mt-2 break-words text-xl font-black sm:text-2xl">
              {member.subscription.pendingPlan.name}
            </p>

            <p className="mt-2 text-sm font-semibold text-zinc-600">
              Applies from:{" "}
              {member.subscription.pendingPlanEffectiveDate
                ? new Date(
                    member.subscription.pendingPlanEffectiveDate
                  ).toLocaleDateString()
                : "Next billing cycle"}
            </p>

            {member.subscription.pendingCoach && (
              <p className="mt-1 text-sm font-semibold text-zinc-600">
                Pending coach: {member.subscription.pendingCoach.name}
              </p>
            )}
          </div>
        )}

        {changingSubscription && (
          <form
            onSubmit={saveSubscriptionChange}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <FormField label="New Membership Plan">
              <select
                value={subscriptionForm.planId}
                onChange={(e) =>
                  updateSubscriptionField("planId", e.target.value)
                }
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
              >
                <option value="">Choose a membership plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {settings.currency}{" "}
                    {plan.monthlyFee.toLocaleString()}
                  </option>
                ))}
              </select>
            </FormField>

            {selectedPlan?.requiresCoach && (
              <FormField label="Select Coach">
                <select
                  value={subscriptionForm.coachId}
                  onChange={(e) =>
                    updateSubscriptionField("coachId", e.target.value)
                  }
                  className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
                >
                  <option value="">Choose a coach</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name} - {coach.specialty}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <div className="rounded-2xl bg-white px-5 py-4 text-black">
              <p className="text-sm font-black text-zinc-500">
                Next Cycle Fee
              </p>
              <p className="mt-1 break-words text-2xl font-black sm:text-3xl">
                {settings.currency} {selectedChangeTotal.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
              <p className="text-sm font-black text-zinc-500">Current Plan</p>
              <p className="mt-1 break-words text-lg font-black sm:text-xl">
                {currentPlanName}
              </p>
              <p className="mt-1 text-xs font-bold text-zinc-600">
                New plan applies from next due date.
              </p>
            </div>

            <button
              disabled={savingSubscription}
              className="shine-effect flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:scale-[1.02] disabled:opacity-60 md:col-span-2 sm:text-base"
            >
              {savingSubscription ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving Pending Change...
                </>
              ) : (
                "Save Change for Next Billing Cycle"
              )}
            </button>
          </form>
        )}
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-black sm:text-2xl">
              Record Monthly Payment
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-zinc-500">
              Renew this member&apos;s monthly subscription. If a pending plan
              change exists and the next due date is reached, it will apply.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRecordingPayment((prev) => !prev)}
            className="w-full rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02] sm:w-fit"
          >
            {recordingPayment ? "Cancel Payment" : "Record Monthly Payment"}
          </button>
        </div>

        {paymentMessage && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-bold text-zinc-300">
            {paymentMessage}
          </div>
        )}

        {recordingPayment && (
          <form
            onSubmit={recordMonthlyPayment}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <FormField label="Payment Method">
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) =>
                  setPaymentForm({
                    paymentMethod: e.target.value,
                  })
                }
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="ONLINE">Online</option>
              </select>
            </FormField>

            <div className="rounded-2xl bg-white px-5 py-4 text-black">
              <p className="text-sm font-black text-zinc-500">
                Renewal Amount
              </p>
              <p className="mt-1 break-words text-2xl font-black sm:text-3xl">
                {settings.currency} {renewalAmount.toLocaleString()}
              </p>
              {member.subscription?.pendingPlan && (
                <p className="mt-1 text-xs font-bold text-zinc-500">
                  Pending plan fee shown. It applies only at due cycle.
                </p>
              )}
            </div>

            <button
              disabled={savingPayment || !member.subscription}
              className="shine-effect flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:scale-[1.02] disabled:opacity-60 md:col-span-2 sm:text-base"
            >
              {savingPayment ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Recording Payment...
                </>
              ) : (
                "Record Payment & Renew Membership"
              )}
            </button>
          </form>
        )}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
            <WalletCards />
          </div>
          <h2 className="mt-5 text-xl font-black sm:text-2xl">
            Subscription
          </h2>

          <div className="mt-5 space-y-3">
            <Detail label="Plan" value={currentPlanName} />
            <Detail
              label="Monthly Fee"
              value={`${settings.currency} ${(
                member.subscription?.totalMonthlyFee || 0
              ).toLocaleString()}`}
            />
            <Detail
              label="Next Due Date"
              value={
                member.subscription?.nextDueDate
                  ? new Date(member.subscription.nextDueDate).toLocaleDateString()
                  : "N/A"
              }
            />
          </div>

          {member.subscription?.pendingPlan && (
            <div className="mt-5 rounded-2xl bg-white p-4 text-black">
              <div className="flex items-center gap-2">
                <ShieldCheck size={17} className="shrink-0" />
                <p className="text-sm font-black text-zinc-500">
                  Pending Next Plan
                </p>
              </div>

              <p className="mt-2 break-words font-black">
                {member.subscription.pendingPlan.name}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
            <Dumbbell />
          </div>
          <h2 className="mt-5 text-xl font-black sm:text-2xl">Coach</h2>

          {member.subscription?.coach ? (
            <div className="mt-5 space-y-3">
              <Detail label="Name" value={member.subscription.coach.name} />
              <Detail
                label="Specialty"
                value={member.subscription.coach.specialty}
              />
              <Detail
                label="Experience"
                value={member.subscription.coach.experience}
              />
              <Detail label="Phone" value={member.subscription.coach.phone} />
            </div>
          ) : (
            <p className="mt-5 text-sm font-semibold text-zinc-500">
              No coach assigned for this membership.
            </p>
          )}

          {member.subscription?.pendingCoach && (
            <div className="mt-5 rounded-2xl bg-white p-4 text-black">
              <p className="text-sm font-black text-zinc-500">
                Pending Coach
              </p>
              <p className="mt-1 break-words font-black">
                {member.subscription.pendingCoach.name}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white p-5 text-black shadow-2xl sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
            <Activity />
          </div>
          <h2 className="mt-5 text-xl font-black sm:text-2xl">
            Latest Body Profile
          </h2>

          {latestBody ? (
            <div className="mt-5 space-y-3">
              <DetailDark
                label="Height"
                value={`${latestBody.heightCm || "-"} cm`}
              />
              <DetailDark
                label="Weight"
                value={`${latestBody.weightKg || "-"} kg`}
              />
              <DetailDark
                label="BMI"
                value={latestBody.bmi ? String(latestBody.bmi) : "-"}
              />
            </div>
          ) : (
            <p className="mt-5 text-sm font-semibold text-zinc-500">
              Body profile not updated yet.
            </p>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <div className="flex items-center gap-3">
          <CalendarClock className="shrink-0" />
          <h2 className="text-xl font-black sm:text-2xl">Payment History</h2>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white text-black">
              <tr>
                <th className="whitespace-nowrap px-5 py-4">Month</th>
                <th className="whitespace-nowrap px-5 py-4">Amount</th>
                <th className="whitespace-nowrap px-5 py-4">Method</th>
                <th className="whitespace-nowrap px-5 py-4">Paid Date</th>
                <th className="whitespace-nowrap px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {member.payments.length === 0 ? (
                <tr>
                  <td className="px-5 py-5 text-zinc-500" colSpan={5}>
                    No payment history.
                  </td>
                </tr>
              ) : (
                member.payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-white/10">
                    <td className="whitespace-nowrap px-5 py-5 font-bold text-zinc-300">
                      {payment.paidForMonth}
                    </td>
                    <td className="whitespace-nowrap px-5 py-5 font-black">
                      {settings.currency} {payment.amount.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-5 py-5 font-bold text-zinc-300">
                      {payment.method}
                    </td>
                    <td className="whitespace-nowrap px-5 py-5 font-bold text-zinc-300">
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-5 py-5">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs font-bold text-zinc-600 sm:hidden">
          Swipe left/right to view the full payment table.
        </p>
      </section>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-bold text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function Info({
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
      <div className="flex items-center gap-2 text-zinc-400">
        <span className="shrink-0">{icon}</span>
        <p className="text-xs font-black uppercase tracking-[0.2em]">
          {label}
        </p>
      </div>
      <p className="mt-2 break-words font-black">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-bold text-zinc-500">{label}</span>
      <span className="break-words text-sm font-black sm:text-right">
        {value}
      </span>
    </div>
  );
}

function DetailDark({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-zinc-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-bold text-zinc-500">{label}</span>
      <span className="break-words text-sm font-black sm:text-right">
        {value}
      </span>
    </div>
  );
}