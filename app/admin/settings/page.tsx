"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Building2,
  Dumbbell,
  ImagePlus,
  Loader2,
  Lock,
  Mail,
  Save,
  Settings,
  ShieldCheck,
  UserRoundCog,
  WalletCards,
} from "lucide-react";

type SettingsData = {
  id: string;
  gymName: string;
  logoUrl: string | null;
  monthlyFee: number;
  personalTrainingFee: number;
  currency: string;
  reminderDaysBefore: number;
};

type Coach = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  specialty: string;
  experience: string;
  description: string | null;
};

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingCoach, setSavingCoach] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [settingsForm, setSettingsForm] = useState({
    gymName: "Dolphin Fitness Center",
    monthlyFee: "3500",
    personalTrainingFee: "15000",
    currency: "LKR",
    reminderDaysBefore: "3",
  });

  const [coachForm, setCoachForm] = useState({
    name: "",
    phone: "",
    email: "",
    specialty: "",
    experience: "",
    description: "",
  });

  const [adminForm, setAdminForm] = useState({
    newEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const selectedCoach = coaches.find((coach) => coach.id === selectedCoachId);

  const totalPersonalTrainingFee = useMemo(() => {
    const monthly = Number(settingsForm.monthlyFee) || 0;
    const personal = Number(settingsForm.personalTrainingFee) || 0;
    return monthly + personal;
  }, [settingsForm.monthlyFee, settingsForm.personalTrainingFee]);

  async function loadSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      if (res.ok) {
        setSettings(data.settings);
        setCoaches(data.coaches || []);

        if (data.admin) {
          setAdminProfile(data.admin);
          setAdminForm((prev) => ({
            ...prev,
            newEmail: data.admin.email || "",
          }));
        }

        setSettingsForm({
          gymName: data.settings.gymName,
          monthlyFee: String(data.settings.monthlyFee),
          personalTrainingFee: String(data.settings.personalTrainingFee),
          currency: data.settings.currency,
          reminderDaysBefore: String(data.settings.reminderDaysBefore),
        });

        setLogoPreview(data.settings.logoUrl || null);

        if (Array.isArray(data.coaches) && data.coaches.length > 0) {
          const firstCoach = data.coaches[0];
          setSelectedCoachId(firstCoach.id);
          setCoachForm({
            name: firstCoach.name,
            phone: firstCoach.phone,
            email: firstCoach.email || "",
            specialty: firstCoach.specialty,
            experience: firstCoach.experience,
            description: firstCoach.description || "",
          });
        }
      }
    } catch (error) {
      console.error("LOAD_SETTINGS_ERROR:", error);
      setMessage("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function updateSettingsField(name: string, value: string) {
    setSettingsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function updateCoachField(name: string, value: string) {
    setCoachForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function updateAdminField(name: string, value: string) {
    setAdminForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleLogoChange(file: File | null) {
    setLogoFile(file);

    if (!file) {
      setLogoPreview(settings?.logoUrl || null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  }

  function handleCoachSelect(coachId: string) {
    setSelectedCoachId(coachId);

    const coach = coaches.find((item) => item.id === coachId);

    if (coach) {
      setCoachForm({
        name: coach.name,
        phone: coach.phone,
        email: coach.email || "",
        specialty: coach.specialty,
        experience: coach.experience,
        description: coach.description || "",
      });
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("gymName", settingsForm.gymName);
      formData.append("monthlyFee", settingsForm.monthlyFee);
      formData.append("personalTrainingFee", settingsForm.personalTrainingFee);
      formData.append("currency", settingsForm.currency);
      formData.append("reminderDaysBefore", settingsForm.reminderDaysBefore);

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to update settings.");
        return;
      }

      setSettings(data.settings);
      setLogoFile(null);
      setLogoPreview(data.settings.logoUrl || null);
      setMessage(
        "Settings updated successfully. Logo and new fees will update across the website and admin side."
      );
    } catch {
      setMessage("Something went wrong while saving settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function saveCoach(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedCoachId) {
      setMessage("Please select a coach.");
      return;
    }

    setSavingCoach(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/coaches/${selectedCoachId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(coachForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to update coach.");
        return;
      }

      setMessage("Coach updated successfully.");
      await loadSettings();
    } catch {
      setMessage("Something went wrong while saving coach.");
    } finally {
      setSavingCoach(false);
    }
  }

  async function saveAdminLogin(e: React.FormEvent) {
    e.preventDefault();

    setSavingAdmin(true);
    setMessage("");

    try {
      if (!adminForm.newEmail.trim()) {
        setMessage("New admin email is required.");
        return;
      }

      if (!adminForm.currentPassword) {
        setMessage("Current password is required.");
        return;
      }

      if (adminForm.newPassword && adminForm.newPassword.length < 6) {
        setMessage("New password must be at least 6 characters.");
        return;
      }

      if (adminForm.newPassword !== adminForm.confirmPassword) {
        setMessage("New password and confirm password do not match.");
        return;
      }

      const res = await fetch("/api/admin/change-login", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newEmail: adminForm.newEmail,
          currentPassword: adminForm.currentPassword,
          newPassword: adminForm.newPassword,
          confirmPassword: adminForm.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to update admin login.");
        return;
      }

      setAdminProfile(data.admin);
      setAdminForm({
        newEmail: data.admin.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage(
        "Admin login updated successfully. Use the new details for your next login."
      );
    } catch {
      setMessage("Something went wrong while updating admin login.");
    } finally {
      setSavingAdmin(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
          Admin Settings
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">
              Functional System Settings
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Update gym logo, gym name, monthly fees, personal training fee,
              reminder rule, coach details, and admin login security.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-black lg:min-w-[180px]">
            <p className="text-sm font-black text-zinc-500">System Status</p>
            <p className="text-3xl font-black">Online</p>
          </div>
        </div>
      </header>

      {message && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-sm font-bold text-zinc-200">
          {message}
        </div>
      )}

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <form
          onSubmit={saveSettings}
          className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <SectionTitle
            icon={<Settings />}
            title="Logo, Fees & Main Settings"
            text="These values will be used for website, admin, and future member registration."
          />

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white text-black">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Gym logo preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlus size={34} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <label className="mb-2 block text-sm font-bold text-zinc-400">
                  Gym Logo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoChange(e.target.files?.[0] || null)}
                  className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-semibold text-white outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-black file:text-black sm:text-base sm:file:text-sm"
                />

                <p className="mt-2 text-xs font-semibold text-zinc-500">
                  Upload PNG, JPG, or WEBP logo. It will update on the website
                  and admin side after saving.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Input
              label="Gym Name"
              value={settingsForm.gymName}
              onChange={(value) => updateSettingsField("gymName", value)}
              type="text"
            />

            <Input
              label="Currency"
              value={settingsForm.currency}
              onChange={(value) => updateSettingsField("currency", value)}
              type="text"
            />

            <Input
              label="Monthly Membership Fee"
              value={settingsForm.monthlyFee}
              onChange={(value) => updateSettingsField("monthlyFee", value)}
            />

            <Input
              label="Personal Training Fee"
              value={settingsForm.personalTrainingFee}
              onChange={(value) =>
                updateSettingsField("personalTrainingFee", value)
              }
            />

            <Input
              label="Reminder Days Before Due Date"
              value={settingsForm.reminderDaysBefore}
              onChange={(value) =>
                updateSettingsField("reminderDaysBefore", value)
              }
            />

            <ReadOnlyBox
              label="Personal Training Total"
              value={`${settingsForm.currency} ${totalPersonalTrainingFee.toLocaleString()}`}
            />
          </div>

          <button
            disabled={savingSettings}
            className="shine-effect mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:scale-[1.02] disabled:opacity-60 sm:text-base"
          >
            {savingSettings ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving Settings...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </form>

        <div className="rounded-[2rem] border border-white/10 bg-white p-5 text-black shadow-2xl sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-black text-white">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Gym logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <WalletCards />
            )}
          </div>

          <h2 className="mt-5 text-xl font-black sm:text-2xl">
            Live Brand Preview
          </h2>

          <div className="mt-6 rounded-[1.5rem] bg-black p-5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-black">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Gym logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Dumbbell />
                )}
              </div>

              <div className="min-w-0">
                <p className="break-words text-lg font-black sm:text-xl">
                  {settingsForm.gymName}
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Center
                </p>
              </div>
            </div>
          </div>

          <h2 className="mt-6 text-xl font-black sm:text-2xl">
            Live Fee Preview
          </h2>

          <div className="mt-6 space-y-4">
            <DarkBox
              label="Normal Monthly"
              value={`${settingsForm.currency} ${Number(
                settingsForm.monthlyFee || 0
              ).toLocaleString()}`}
            />
            <DarkBox
              label="Personal Training Add-on"
              value={`${settingsForm.currency} ${Number(
                settingsForm.personalTrainingFee || 0
              ).toLocaleString()}`}
            />
            <DarkBox
              label="PT Member Monthly Total"
              value={`${settingsForm.currency} ${totalPersonalTrainingFee.toLocaleString()}`}
            />
          </div>

          <p className="mt-5 text-sm font-semibold leading-6 text-zinc-500">
            Existing members keep their current saved subscription fee. New
            registrations will use the updated fee values.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <SectionTitle
          icon={<ShieldCheck />}
          title="Admin Login Security"
          text="Change admin email and password from here. Current password is required for security."
        />

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
            Current Admin Account
          </p>
          <p className="mt-2 break-all text-lg font-black text-white">
            {adminProfile?.email || "Admin email not loaded"}
          </p>
        </div>

        <form
          onSubmit={saveAdminLogin}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <SecureInput
            icon={<Mail size={18} />}
            label="New Admin Email"
            value={adminForm.newEmail}
            onChange={(value) => updateAdminField("newEmail", value)}
            type="email"
          />

          <SecureInput
            icon={<Lock size={18} />}
            label="Current Password"
            value={adminForm.currentPassword}
            onChange={(value) => updateAdminField("currentPassword", value)}
            type="password"
          />

          <SecureInput
            icon={<Lock size={18} />}
            label="New Password Optional"
            value={adminForm.newPassword}
            onChange={(value) => updateAdminField("newPassword", value)}
            type="password"
          />

          <SecureInput
            icon={<Lock size={18} />}
            label="Confirm New Password"
            value={adminForm.confirmPassword}
            onChange={(value) => updateAdminField("confirmPassword", value)}
            type="password"
          />

          <div className="md:col-span-2">
            <button
              disabled={savingAdmin}
              className="shine-effect flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:scale-[1.02] disabled:opacity-60 sm:text-base"
            >
              {savingAdmin ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving Admin Login...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Save Admin Login Details
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <SectionTitle
            icon={<Dumbbell />}
            title="Select Coach"
            text="Choose a coach and update details."
          />

          <div className="mt-6 space-y-3">
            {coaches.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-bold text-zinc-500">
                No coaches found.
              </div>
            ) : (
              coaches.map((coach) => {
                const active = selectedCoachId === coach.id;

                return (
                  <button
                    key={coach.id}
                    type="button"
                    onClick={() => handleCoachSelect(coach.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-1 ${
                      active
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-black/30 text-white hover:bg-black/50"
                    }`}
                  >
                    <p className="break-words font-black">{coach.name}</p>
                    <p
                      className={`mt-1 break-words text-sm font-bold ${
                        active ? "text-zinc-600" : "text-zinc-500"
                      }`}
                    >
                      {coach.specialty} • {coach.experience}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <form
          onSubmit={saveCoach}
          className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <SectionTitle
            icon={<UserRoundCog />}
            title="Edit Coach Details"
            text={
              selectedCoach
                ? `Editing ${selectedCoach.name}`
                : "Select a coach first"
            }
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Input
              label="Coach Name"
              value={coachForm.name}
              onChange={(value) => updateCoachField("name", value)}
              type="text"
            />

            <Input
              label="Phone"
              value={coachForm.phone}
              onChange={(value) => updateCoachField("phone", value)}
              type="text"
            />

            <Input
              label="Email"
              value={coachForm.email}
              onChange={(value) => updateCoachField("email", value)}
              type="text"
            />

            <Input
              label="Specialty"
              value={coachForm.specialty}
              onChange={(value) => updateCoachField("specialty", value)}
              type="text"
            />

            <Input
              label="Experience"
              value={coachForm.experience}
              onChange={(value) => updateCoachField("experience", value)}
              type="text"
            />
          </div>

          <TextArea
            label="Description"
            rows={5}
            value={coachForm.description}
            onChange={(value) => updateCoachField("description", value)}
          />

          <button
            disabled={savingCoach || !selectedCoachId}
            className="shine-effect mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:scale-[1.02] disabled:opacity-60 sm:text-base"
          >
            {savingCoach ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving Coach...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Coach
              </>
            )}
          </button>
        </form>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-3">
        <FeaturePanel
          icon={<Building2 />}
          title="Business Settings"
          text="Gym name, logo, currency, and system values are now stored in the database."
        />

        <FeaturePanel
          icon={<BellRing />}
          title="Reminder Rule"
          text={`Reminder dashboard uses ${settingsForm.reminderDaysBefore} day rule before due date.`}
        />

        <FeaturePanel
          icon={<ShieldCheck />}
          title="Connected Pages"
          text="Website, admin dashboard, registration, reports, coaches, reminders, and admin login can use these updated settings."
        />
      </section>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="break-words text-xl font-black sm:text-2xl">{title}</h2>
        <p className="break-words text-sm font-semibold text-zinc-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "number",
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

function SecureInput({
  icon,
  label,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ReactNode;
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

      <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
        <div className="shrink-0 text-zinc-500">{icon}</div>
        <input
          required={label === "New Admin Email" || label === "Current Password"}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent font-semibold text-white outline-none placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
}

function TextArea({
  label,
  rows,
  value,
  onChange,
}: {
  label: string;
  rows: number;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-4 min-w-0">
      <label className="mb-2 block text-sm font-bold text-zinc-400">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
      />
    </div>
  );
}

function ReadOnlyBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-bold text-zinc-400">
        {label}
      </label>
      <div className="rounded-2xl border border-white/10 bg-white px-4 py-4 text-black">
        <p className="break-words font-black">{value}</p>
      </div>
    </div>
  );
}

function DarkBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-100 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 break-words text-xl font-black">{value}</p>
    </div>
  );
}

function FeaturePanel({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
        {icon}
      </div>
      <h2 className="mt-5 break-words text-xl font-black sm:text-2xl">
        {title}
      </h2>
      <p className="mt-2 break-words text-sm font-semibold leading-6 text-zinc-500">
        {text}
      </p>
    </div>
  );
}