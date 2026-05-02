"use client";

import PublicFooterClient from "@/components/PublicFooterClient";
import PublicNavbarClient from "@/components/PublicNavbarClient";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Crown,
  Dumbbell,
  Loader2,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

type Coach = {
  id: string;
  name: string;
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
  logoUrl: string | null;
  monthlyFee: number;
  personalTrainingFee: number;
  personalTrainingTotal: number;
  currency: string;
  reminderDaysBefore: number;
};

export default function RegisterPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);

  const [settings, setSettings] = useState<PublicSettings>({
    gymName: "Dolphin Fitness Center",
    logoUrl: null,
    monthlyFee: 3500,
    personalTrainingFee: 15000,
    personalTrainingTotal: 18500,
    currency: "LKR",
    reminderDaysBefore: 3,
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [loadingPageData, setLoadingPageData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    address: "",
    email: "",
    phone: "",
    password: "",
    planId: "",
    coachId: "",
    paymentMethod: "CASH",
  });

  const selectedPlan = plans.find((plan) => plan.id === form.planId);

  useEffect(() => {
    async function loadPageData() {
      try {
        const [coachesRes, settingsRes, plansRes] = await Promise.all([
          fetch("/api/coaches"),
          fetch("/api/settings"),
          fetch("/api/public/membership-plans"),
        ]);

        const coachesData = await coachesRes.json();
        const settingsData = await settingsRes.json();
        const plansData = await plansRes.json();

        if (Array.isArray(coachesData)) {
          setCoaches(coachesData);
        }

        if (settingsRes.ok) {
          setSettings({
            gymName: settingsData.gymName || "Dolphin Fitness Center",
            logoUrl: settingsData.logoUrl || null,
            monthlyFee: settingsData.monthlyFee || 3500,
            personalTrainingFee: settingsData.personalTrainingFee || 15000,
            personalTrainingTotal:
              settingsData.personalTrainingTotal ||
              (settingsData.monthlyFee || 3500) +
                (settingsData.personalTrainingFee || 15000),
            currency: settingsData.currency || "LKR",
            reminderDaysBefore: settingsData.reminderDaysBefore || 3,
          });
        }

        if (Array.isArray(plansData)) {
          setPlans(plansData);

          const params = new URLSearchParams(window.location.search);
          const planSlugFromUrl = params.get("plan");

          const planFromUrl = plansData.find(
            (plan: MembershipPlan) => plan.slug === planSlugFromUrl
          );

          const firstPlan = plansData[0];

          setForm((prev) => ({
            ...prev,
            planId: planFromUrl?.id || firstPlan?.id || "",
          }));
        }
      } catch {
        setMessage("Could not load page data. Check database connection.");
      } finally {
        setLoadingPageData(false);
      }
    }

    loadPageData();
  }, []);

  const totalFee = useMemo(() => {
    return selectedPlan?.monthlyFee || 0;
  }, [selectedPlan]);

  const selectedFeatures = useMemo(() => {
    return (selectedPlan?.features || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [selectedPlan]);

  function updateField(name: string, value: string) {
    setForm((prev) => {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (!selectedPlan) {
        setMessage("Please select a membership plan.");
        return;
      }

      if (selectedPlan.requiresCoach && !form.coachId) {
        setMessage("Please select a coach for this membership plan.");
        return;
      }

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append(
        "subscriptionType",
        selectedPlan.isPersonalTraining ? "PERSONAL_TRAINING" : "NORMAL_MONTHLY"
      );

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setMessage("Registration successful. Member saved to database.");

      setForm({
        firstName: "",
        lastName: "",
        age: "",
        address: "",
        email: "",
        phone: "",
        password: "",
        planId: plans[0]?.id || "",
        coachId: "",
        paymentMethod: "CASH",
      });

      setProfileImage(null);
    } catch {
      setMessage("Something went wrong. Please check the API/database.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <PublicNavbarClient />

      <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
        <div className="pointer-events-none fixed inset-0">
          <div className="animate-glow-pulse absolute left-[-20%] top-[-20%] h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl sm:h-[500px] sm:w-[500px]" />
          <div className="animate-float-slow absolute bottom-[-20%] right-[-20%] h-[360px] w-[360px] rounded-full bg-zinc-500/20 blur-3xl sm:h-[500px] sm:w-[500px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="animate-slide-up">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
              Member Registration
            </p>

            <h1 className="mt-3 break-words text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
              Create Membership
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Register a new member, upload profile picture, select a membership
              plan, record first payment, and save next due date.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.8fr]">
            <form
              onSubmit={handleSubmit}
              className="animate-slide-up rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur sm:p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-black sm:h-16 sm:w-16">
                <UserPlus size={30} />
              </div>

              <h2 className="mt-8 text-3xl font-black sm:text-4xl">
                Member Details
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Fill member details carefully. This information will appear in
                the member profile and admin dashboard.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Input
                  label="First Name"
                  value={form.firstName}
                  onChange={(value) => updateField("firstName", value)}
                />

                <Input
                  label="Last Name"
                  value={form.lastName}
                  onChange={(value) => updateField("lastName", value)}
                />

                <Input
                  label="Age"
                  type="number"
                  value={form.age}
                  onChange={(value) => updateField("age", value)}
                />

                <Input
                  label="Phone Number"
                  value={form.phone}
                  onChange={(value) => updateField("phone", value)}
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(value) => updateField("email", value)}
                />

                <Input
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(value) => updateField("password", value)}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    value={form.address}
                    onChange={(value) => updateField("address", value)}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-bold text-zinc-400">
                  Profile Picture
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProfileImage(e.target.files?.[0] || null)
                  }
                  className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm font-semibold text-white outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-black file:text-black sm:text-base sm:file:text-sm"
                />

                {profileImage && (
                  <p className="mt-2 break-words text-sm font-bold text-zinc-500">
                    Selected: {profileImage.name}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500 sm:text-sm sm:tracking-[0.2em]">
                  Membership Plan
                </p>

                {loadingPageData ? (
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm font-bold text-zinc-400">
                    Loading plans...
                  </div>
                ) : plans.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm font-bold text-zinc-400">
                    No membership plans available. Please contact admin.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {plans.map((plan) => (
                      <PlanOption
                        key={plan.id}
                        plan={plan}
                        currency={settings.currency}
                        active={form.planId === plan.id}
                        onClick={() => updateField("planId", plan.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {selectedPlan?.requiresCoach && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500 sm:text-sm sm:tracking-[0.2em]">
                    Select Coach
                  </p>

                  {loadingPageData ? (
                    <p className="text-sm text-zinc-400">Loading coaches...</p>
                  ) : (
                    <select
                      value={form.coachId}
                      onChange={(e) => updateField("coachId", e.target.value)}
                      className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
                    >
                      <option value="">Choose a coach</option>
                      {coaches.map((coach) => (
                        <option key={coach.id} value={coach.id}>
                          {coach.name} - {coach.specialty}
                        </option>
                      ))}
                    </select>
                  )}

                  <p className="mt-2 text-xs font-bold text-zinc-500">
                    Coach selection is required for {selectedPlan.name}.
                  </p>
                </div>
              )}

              <div className="mt-6">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500 sm:text-sm sm:tracking-[0.2em]">
                  Payment Method
                </p>

                <select
                  value={form.paymentMethod}
                  onChange={(e) =>
                    updateField("paymentMethod", e.target.value)
                  }
                  className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>

              {message && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm font-bold text-zinc-200">
                  {message}
                </div>
              )}

              <button
                disabled={submitting || loadingPageData || !selectedPlan}
                className="shine-effect mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black transition duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Saving Member...
                  </>
                ) : (
                  "Register & Record Payment"
                )}
              </button>
            </form>

            <div className="animate-slide-left h-fit rounded-[2rem] border border-white/10 bg-white p-5 text-black shadow-2xl sm:p-8 lg:sticky lg:top-8">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl bg-black text-white sm:h-16 sm:w-16">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.gymName}
                    className="h-full w-full object-cover"
                  />
                ) : selectedPlan?.requiresCoach ? (
                  <Crown size={30} />
                ) : (
                  <Dumbbell size={30} />
                )}
              </div>

              <h2 className="mt-8 text-3xl font-black sm:text-4xl">
                Payment Summary
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">
                Registration requires payment immediately. A member can have
                only one active subscription at a time.
              </p>

              <div className="mt-8 rounded-[1.5rem] bg-black p-5 text-white sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 sm:text-sm">
                  Selected Plan
                </p>

                <p className="mt-2 break-words text-xl font-black sm:text-2xl">
                  {selectedPlan?.name || "No plan selected"}
                </p>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 sm:text-sm">
                  Total Due Today
                </p>

                <p className="mt-3 break-words text-4xl font-black sm:text-5xl">
                  {settings.currency} {totalFee.toLocaleString()}
                </p>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Next due date will be automatically set to one month after
                  registration.
                </p>
              </div>

              {selectedFeatures.length > 0 && (
                <div className="mt-8 space-y-4">
                  {selectedFeatures.slice(0, 6).map((feature) => (
                    <SummaryItem key={feature} text={feature} />
                  ))}
                </div>
              )}

              <div className="mt-8 space-y-4">
                <SummaryItem text="Profile picture can be uploaded" />
                <SummaryItem text="First payment recorded" />
                <SummaryItem text="Body profile can be updated by admin later" />
                <SummaryItem text="Plan changes apply from next billing cycle" />
              </div>

              {selectedPlan?.requiresCoach && (
                <div className="mt-8 rounded-[1.5rem] bg-zinc-100 p-5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="shrink-0" />
                    <p className="font-black">Diamond Coach Selection</p>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-zinc-600">
                    This plan requires a coach. The selected coach will be saved
                    with the member subscription.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <PublicFooterClient />
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const inputMode =
    label === "Phone Number" || label === "Age" ? "numeric" : undefined;

  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-bold text-zinc-400">
        {label}
      </label>

      <input
        required
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
      />
    </div>
  );
}

function PlanOption({
  plan,
  currency,
  active,
  onClick,
}: {
  plan: MembershipPlan;
  currency: string;
  active: boolean;
  onClick: () => void;
}) {
  const highlighted =
    plan.isPersonalTraining ||
    plan.requiresCoach ||
    plan.slug.includes("diamond");

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 rounded-[1.5rem] border p-5 text-left transition duration-300 hover:-translate-y-1 ${
        active
          ? "border-white bg-white text-black"
          : "border-white/10 bg-black/40 text-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-black sm:text-xl">
            {plan.name}
          </h3>

          <p className="mt-2 break-words text-2xl font-black sm:text-3xl">
            {currency} {plan.monthlyFee.toLocaleString()}
          </p>
        </div>

        <div className="shrink-0">
          {highlighted ? <Crown size={24} /> : <Dumbbell size={24} />}
        </div>
      </div>

      <p
        className={`mt-3 break-words text-sm font-semibold ${
          active ? "text-zinc-600" : "text-zinc-500"
        }`}
      >
        {plan.description || "Monthly subscription only"}
      </p>

      {plan.requiresCoach && (
        <div
          className={`mt-4 rounded-full px-3 py-2 text-center text-xs font-black ${
            active ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          Coach selection required
        </div>
      )}
    </button>
  );
}

function SummaryItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-black">
      <CheckCircle2 size={18} className="shrink-0" />
      <span className="break-words">{text}</span>
    </div>
  );
}