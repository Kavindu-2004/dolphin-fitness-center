"use client";

import PublicFooterClient from "@/components/PublicFooterClient";
import PublicNavbarClient from "@/components/PublicNavbarClient";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  CreditCard,
  Crown,
  Dumbbell,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Coach = {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  experience: string;
  description?: string | null;
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

type MemberProfile = {
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
      description: string | null;
    } | null;
    pendingCoach?: {
      id?: string;
      name: string;
      phone: string;
      specialty: string;
      experience: string;
      description: string | null;
    } | null;
  } | null;
  payments: {
    id: string;
    amount: number;
    method: string;
    status: string;
    paidForMonth: string;
    paidAt: string;
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

export default function MyProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<MemberProfile | null>(null);
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

  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);

  const [changingSubscription, setChangingSubscription] = useState(false);
  const [savingSubscription, setSavingSubscription] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");

  const [creatingOnlinePayment, setCreatingOnlinePayment] = useState(false);
  const [onlinePaymentMessage, setOnlinePaymentMessage] = useState("");

  const [editForm, setEditForm] = useState({
    email: "",
    phone: "",
    address: "",
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    planId: "",
    coachId: "",
  });

  async function loadProfile() {
    const memberId = localStorage.getItem("dolphin_member_id");

    if (!memberId) {
      router.push("/login");
      return;
    }

    try {
      const [profileRes, coachesRes, settingsRes, plansRes] =
        await Promise.all([
          fetch(`/api/member/profile?memberId=${memberId}`),
          fetch("/api/coaches"),
          fetch("/api/settings"),
          fetch("/api/public/membership-plans"),
        ]);

      const profileData = await profileRes.json();
      const coachesData = await coachesRes.json();
      const settingsData = await settingsRes.json();
      const plansData = await plansRes.json();

      if (profileRes.ok) {
        setProfile(profileData);

        setEditForm({
          email: profileData.user.email,
          phone: profileData.user.phone,
          address: profileData.address || "",
        });

        setSubscriptionForm({
          planId:
            profileData.subscription?.pendingPlan?.id ||
            profileData.subscription?.plan?.id ||
            "",
          coachId:
            profileData.subscription?.pendingCoach?.id ||
            profileData.subscription?.coach?.id ||
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [router]);

  const selectedPlan = plans.find((plan) => plan.id === subscriptionForm.planId);

  const selectedChangeTotal = useMemo(() => {
    return selectedPlan?.monthlyFee || 0;
  }, [selectedPlan]);

  function updateEditField(name: string, value: string) {
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

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

  async function saveProfileUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!profile) return;

    setSavingProfile(true);
    setProfileMessage("");

    try {
      const formData = new FormData();

      formData.append("memberId", profile.id);
      formData.append("email", editForm.email);
      formData.append("phone", editForm.phone);
      formData.append("address", editForm.address);

      if (newProfileImage) {
        formData.append("profileImage", newProfileImage);
      }

      const res = await fetch("/api/member/profile", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileMessage(data.message || "Failed to update profile.");
        return;
      }

      setProfile(data.member);
      setNewProfileImage(null);
      setEditing(false);
      setProfileMessage("Profile updated successfully.");
    } catch {
      setProfileMessage("Something went wrong.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveSubscriptionChange(e: React.FormEvent) {
    e.preventDefault();

    if (!profile) return;

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
          memberId: profile.id,
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

      await loadProfile();
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

  async function startOnlinePayment() {
    if (!profile) return;

    setCreatingOnlinePayment(true);
    setOnlinePaymentMessage("");

    try {
      const res = await fetch("/api/member/online-payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: profile.id,
          purpose: "MEMBERSHIP_RENEWAL",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOnlinePaymentMessage(
          data.message || "Failed to create online payment."
        );
        return;
      }

      router.push(`/payment/success?onlinePaymentId=${data.onlinePayment.id}`);
    } catch {
      setOnlinePaymentMessage("Something went wrong while creating payment.");
    } finally {
      setCreatingOnlinePayment(false);
    }
  }

  function logout() {
    localStorage.removeItem("dolphin_member_id");
    localStorage.removeItem("dolphin_member_name");
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen overflow-hidden bg-black text-white">
        <PublicNavbarClient />
        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
            Loading your profile...
          </div>
        </section>
        <PublicFooterClient />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen overflow-hidden bg-black text-white">
        <PublicNavbarClient />
        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
            Profile not found.
          </div>
        </section>
        <PublicFooterClient />
      </main>
    );
  }

  const latestBody = profile.bodyProfiles[0];

  const currentPlanName =
    profile.subscription?.plan?.name ||
    (profile.subscription?.type === "PERSONAL_TRAINING"
      ? "Personal Training"
      : "Normal Monthly");

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <PublicNavbarClient />

      <section className="relative px-4 py-8 sm:px-6 sm:py-10">
        <div className="pointer-events-none fixed inset-0">
          <div className="animate-glow-pulse absolute left-[-20%] top-[-20%] h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl sm:h-[500px] sm:w-[500px]" />
          <div className="animate-float-slow absolute bottom-[-20%] right-[-20%] h-[360px] w-[360px] rounded-full bg-zinc-500/20 blur-3xl sm:h-[500px] sm:w-[500px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex items-center justify-end">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          <header className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[1.5rem] bg-white text-black">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.user.name}
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
                    {profile.memberNo}
                  </p>
                  <h1 className="mt-2 break-words text-3xl font-black tracking-tight sm:text-5xl">
                    {profile.user.name}
                  </h1>
                  <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                    Age {profile.age || "N/A"} • Joined{" "}
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <span className="w-fit shrink-0 rounded-full bg-white px-4 py-2 text-sm font-black text-black">
                {profile.subscription?.status || "NO PLAN"}
              </span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Info
                icon={<Mail size={18} />}
                label="Email"
                value={profile.user.email}
              />
              <Info
                icon={<Phone size={18} />}
                label="Phone"
                value={profile.user.phone}
              />
              <Info
                icon={<MapPin size={18} />}
                label="Address"
                value={profile.address || "No address"}
              />
            </div>
          </header>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white p-5 text-black shadow-2xl sm:p-6">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                  <CreditCard size={26} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-2xl font-black">Pay Online</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-zinc-500">
                    Pay your monthly membership online. Pending plan changes
                    apply only during renewal.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-black px-5 py-4 text-white">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                  Current Amount Due
                </p>
                <p className="mt-1 break-words text-2xl font-black sm:text-3xl">
                  {settings.currency}{" "}
                  {(profile.subscription?.totalMonthlyFee || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {onlinePaymentMessage && (
              <div className="mt-5 rounded-2xl bg-zinc-100 px-4 py-4 text-sm font-bold text-zinc-700">
                {onlinePaymentMessage}
              </div>
            )}

            <button
              onClick={startOnlinePayment}
              disabled={creatingOnlinePayment || !profile.subscription}
              className="shine-effect mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-4 text-sm font-black text-white transition hover:scale-[1.02] disabled:opacity-60 sm:text-base"
            >
              {creatingOnlinePayment ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating Online Payment...
                </>
              ) : (
                "Pay Online Now"
              )}
            </button>
          </section>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="min-w-0">
                <h2 className="text-xl font-black sm:text-2xl">
                  Edit Profile
                </h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-zinc-500">
                  Update your email, phone number, address, and profile picture.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing((prev) => !prev)}
                className="w-full rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02] sm:w-fit"
              >
                {editing ? "Cancel Edit" : "Edit Profile"}
              </button>
            </div>

            {profileMessage && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-bold text-zinc-300">
                {profileMessage}
              </div>
            )}

            {editing && (
              <form
                onSubmit={saveProfileUpdate}
                className="mt-6 grid gap-4 md:grid-cols-2"
              >
                <ProfileInput
                  label="Email"
                  type="email"
                  value={editForm.email}
                  onChange={(value) => updateEditField("email", value)}
                />

                <ProfileInput
                  label="Phone Number"
                  value={editForm.phone}
                  onChange={(value) => updateEditField("phone", value)}
                />

                <div className="md:col-span-2">
                  <ProfileInput
                    label="Address"
                    value={editForm.address}
                    onChange={(value) => updateEditField("address", value)}
                  />
                </div>

                <div className="min-w-0 md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-zinc-400">
                    New Profile Picture
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewProfileImage(e.target.files?.[0] || null)
                    }
                    className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-semibold text-white outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-black file:text-black sm:text-base sm:file:text-sm"
                  />

                  {newProfileImage && (
                    <p className="mt-2 break-words text-sm font-bold text-zinc-500">
                      Selected: {newProfileImage.name}
                    </p>
                  )}
                </div>

                <button
                  disabled={savingProfile}
                  className="shine-effect flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:scale-[1.02] disabled:opacity-60 md:col-span-2 sm:text-base"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Saving Profile...
                    </>
                  ) : (
                    "Save Profile Changes"
                  )}
                </button>
              </form>
            )}
          </section>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="min-w-0">
                <h2 className="text-xl font-black sm:text-2xl">
                  Change Subscription for Next Billing Cycle
                </h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-zinc-500">
                  Choose a new membership plan. No payment is charged now. The
                  new plan applies from your next billing cycle.
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

            {profile.subscription?.pendingPlan && (
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white p-5 text-black">
                <div className="flex items-center gap-2">
                  <Crown size={18} className="shrink-0" />
                  <p className="text-sm font-black text-zinc-600">
                    Pending Plan Change
                  </p>
                </div>

                <p className="mt-2 break-words text-xl font-black sm:text-2xl">
                  {profile.subscription.pendingPlan.name}
                </p>

                <p className="mt-2 text-sm font-semibold text-zinc-600">
                  Applies from:{" "}
                  {profile.subscription.pendingPlanEffectiveDate
                    ? new Date(
                        profile.subscription.pendingPlanEffectiveDate
                      ).toLocaleDateString()
                    : "Next billing cycle"}
                </p>

                {profile.subscription.pendingCoach && (
                  <p className="mt-1 text-sm font-semibold text-zinc-600">
                    Pending coach: {profile.subscription.pendingCoach.name}
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
                  <p className="text-sm font-black text-zinc-500">
                    Current Plan
                  </p>
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

          <section className="mt-8 grid gap-6 xl:grid-cols-3">
            <Card icon={<WalletCards />} title="Subscription">
              <Detail label="Plan" value={currentPlanName} />
              <Detail
                label="Monthly Fee"
                value={`${settings.currency} ${(
                  profile.subscription?.totalMonthlyFee || 0
                ).toLocaleString()}`}
              />
              <Detail
                label="Next Due Date"
                value={
                  profile.subscription?.nextDueDate
                    ? new Date(
                        profile.subscription.nextDueDate
                      ).toLocaleDateString()
                    : "N/A"
                }
              />

              {profile.subscription?.pendingPlan && (
                <div className="rounded-2xl bg-white px-4 py-3 text-black">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={17} className="shrink-0" />
                    <span className="text-sm font-bold text-zinc-500">
                      Pending Next Plan
                    </span>
                  </div>
                  <p className="mt-2 break-words text-sm font-black">
                    {profile.subscription.pendingPlan.name}
                  </p>
                </div>
              )}
            </Card>

            <Card icon={<Dumbbell />} title="Coach">
              {profile.subscription?.coach ? (
                <>
                  <Detail
                    label="Name"
                    value={profile.subscription.coach.name}
                  />
                  <Detail
                    label="Specialty"
                    value={profile.subscription.coach.specialty}
                  />
                  <Detail
                    label="Experience"
                    value={profile.subscription.coach.experience}
                  />
                  <Detail
                    label="Phone"
                    value={profile.subscription.coach.phone}
                  />
                </>
              ) : (
                <p className="text-sm font-semibold text-zinc-500">
                  No coach assigned for this membership.
                </p>
              )}

              {profile.subscription?.pendingCoach && (
                <div className="rounded-2xl bg-white px-4 py-3 text-black">
                  <span className="text-sm font-bold text-zinc-500">
                    Pending Coach
                  </span>
                  <p className="mt-2 break-words text-sm font-black">
                    {profile.subscription.pendingCoach.name}
                  </p>
                </div>
              )}
            </Card>

            <div className="rounded-[2rem] border border-white/10 bg-white p-5 text-black shadow-2xl sm:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                <Activity />
              </div>
              <h2 className="mt-5 text-2xl font-black">
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
                  <DetailDark
                    label="Measured"
                    value={new Date(latestBody.measuredAt).toLocaleDateString()}
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
              <h2 className="text-xl font-black sm:text-2xl">
                Payment History
              </h2>
            </div>

            <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-white/10">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-white text-black">
                  <tr>
                    <th className="px-5 py-4">Month</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Method</th>
                    <th className="px-5 py-4">Paid Date</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {profile.payments.length === 0 ? (
                    <tr>
                      <td className="px-5 py-5 text-zinc-500" colSpan={5}>
                        No payment history.
                      </td>
                    </tr>
                  ) : (
                    profile.payments.map((payment) => (
                      <tr key={payment.id} className="border-t border-white/10">
                        <td className="px-5 py-5 font-bold text-zinc-300">
                          {payment.paidForMonth}
                        </td>
                        <td className="px-5 py-5 font-black">
                          {settings.currency} {payment.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-5 font-bold text-zinc-300">
                          {payment.method}
                        </td>
                        <td className="px-5 py-5 font-bold text-zinc-300">
                          {new Date(payment.paidAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-5">
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
          </section>
        </div>
      </section>

      <PublicFooterClient />
    </main>
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

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
        {icon}
      </div>
      <h2 className="mt-5 text-2xl font-black">{title}</h2>
      <div className="mt-5 space-y-3">{children}</div>
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

function ProfileInput({
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
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-bold text-zinc-400">
        {label}
      </label>

      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
      />
    </div>
  );
}