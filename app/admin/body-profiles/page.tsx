"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  Dumbbell,
  Loader2,
  Ruler,
  Save,
  Search,
  UserRound,
  Weight,
} from "lucide-react";

type Member = {
  id: string;
  memberNo: string;
  age: number | null;
  address: string | null;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  subscription: {
    type: "NORMAL_MONTHLY" | "PERSONAL_TRAINING";
    status: string;
  } | null;
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

export default function AdminBodyProfilesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    heightCm: "",
    weightKg: "",
    chest: "",
    waist: "",
    hip: "",
    biceps: "",
    thigh: "",
    bodyFat: "",
    notes: "",
  });

  async function loadBodyProfiles() {
    try {
      const res = await fetch("/api/admin/body-profiles");
      const data = await res.json();

      if (Array.isArray(data)) {
        setMembers(data);
      }
    } catch (error) {
      console.error("LOAD_BODY_PROFILES_ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBodyProfiles();
  }, []);

  const selectedMember = members.find((member) => member.id === selectedMemberId);

  const bmiPreview = useMemo(() => {
    const height = Number(form.heightCm);
    const weight = Number(form.weightKg);

    if (!height || !weight) return "Auto";

    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(2);
  }, [form.heightCm, form.weightKg]);

  const filteredMembers = members.filter((member) => {
    const q = search.toLowerCase();

    return (
      member.user.name.toLowerCase().includes(q) ||
      member.user.email.toLowerCase().includes(q) ||
      member.user.phone.toLowerCase().includes(q) ||
      member.memberNo.toLowerCase().includes(q)
    );
  });

  function updateField(name: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/body-profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: selectedMemberId,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to save body profile.");
        return;
      }

      setMessage("Body profile saved successfully.");

      setForm({
        heightCm: "",
        weightKg: "",
        chest: "",
        waist: "",
        hip: "",
        biceps: "",
        thigh: "",
        bodyFat: "",
        notes: "",
      });

      await loadBodyProfiles();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
          Admin Body Profiles
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">
              Body Profile Management
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Update height, weight, BMI, and body measurements after physically
              collecting measurements at the gym.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-black lg:min-w-[190px]">
            <p className="text-sm font-black text-zinc-500">Member Records</p>
            <p className="text-3xl font-black">{members.length}</p>
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
              <UserRound />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-black sm:text-2xl">Select Member</h2>
              <p className="text-sm font-semibold text-zinc-500">
                Choose a member to update body profile.
              </p>
            </div>
          </div>

          <div className="mt-6 flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
            <Search size={18} className="shrink-0 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member..."
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600 sm:text-base"
            />
          </div>

          <div className="mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1 sm:pr-2">
            {loading ? (
              <p className="text-sm text-zinc-400">Loading members...</p>
            ) : filteredMembers.length === 0 ? (
              <p className="text-sm text-zinc-400">No members found.</p>
            ) : (
              filteredMembers.map((member) => {
                const latest = member.bodyProfiles[0];
                const active = selectedMemberId === member.id;

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setMessage("");
                    }}
                    className={`w-full min-w-0 rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-1 ${
                      active
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-black/30 text-white hover:bg-black/50"
                    }`}
                  >
                    <p className="truncate font-black">{member.user.name}</p>

                    <p
                      className={`mt-1 truncate text-xs font-bold ${
                        active ? "text-zinc-600" : "text-zinc-500"
                      }`}
                    >
                      {member.memberNo} • Age {member.age || "N/A"}
                    </p>

                    <p
                      className={`mt-2 truncate text-xs font-bold ${
                        active ? "text-zinc-600" : "text-zinc-500"
                      }`}
                    >
                      Latest BMI: {latest?.bmi || "Not updated"}
                    </p>

                    <p
                      className={`mt-1 truncate text-xs font-bold ${
                        active ? "text-zinc-600" : "text-zinc-600"
                      }`}
                    >
                      Body records: {member.bodyProfiles.length}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
              <Dumbbell />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-black sm:text-2xl">
                Update Measurements
              </h2>
              <p className="truncate text-sm font-semibold text-zinc-500">
                {selectedMember
                  ? `Selected: ${selectedMember.user.name}`
                  : "Select a member first"}
              </p>
            </div>
          </div>

          {selectedMember && (
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <p className="break-words text-sm font-black text-white">
                    Current Body Profile History
                  </p>
                  <p className="mt-1 break-words text-xs font-bold text-zinc-500">
                    Latest saved measurements for {selectedMember.user.name}
                  </p>
                </div>

                <span className="w-fit shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                  {selectedMember.bodyProfiles.length} Records
                </span>
              </div>

              {selectedMember.bodyProfiles.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm font-bold text-zinc-500">
                  No body profile records saved yet.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {selectedMember.bodyProfiles.slice(0, 5).map((profile, index) => (
                    <div
                      key={profile.id}
                      className="rounded-2xl border border-white/10 bg-black/40 p-4"
                    >
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <p className="font-black text-white">
                          {index === 0
                            ? "Latest Body Profile"
                            : `Previous Body Profile ${index}`}
                        </p>

                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                          <CalendarClock size={14} />
                          {new Date(profile.measuredAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <ProfileBox
                          label="Height"
                          value={`${profile.heightCm || "-"} cm`}
                        />
                        <ProfileBox
                          label="Weight"
                          value={`${profile.weightKg || "-"} kg`}
                        />
                        <ProfileBox
                          label="BMI"
                          value={profile.bmi ? String(profile.bmi) : "-"}
                        />
                        <ProfileBox
                          label="Body Fat"
                          value={
                            profile.bodyFat !== null
                              ? `${profile.bodyFat}%`
                              : "-"
                          }
                        />
                        <ProfileBox
                          label="Chest"
                          value={profile.chest ? String(profile.chest) : "-"}
                        />
                        <ProfileBox
                          label="Waist"
                          value={profile.waist ? String(profile.waist) : "-"}
                        />
                        <ProfileBox
                          label="Hip"
                          value={profile.hip ? String(profile.hip) : "-"}
                        />
                        <ProfileBox
                          label="Biceps"
                          value={profile.biceps ? String(profile.biceps) : "-"}
                        />
                        <ProfileBox
                          label="Thigh"
                          value={profile.thigh ? String(profile.thigh) : "-"}
                        />
                      </div>

                      {profile.notes && (
                        <div className="mt-4 rounded-2xl bg-white p-4 text-black">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                            Notes
                          </p>
                          <p className="mt-2 break-words text-sm font-bold leading-6">
                            {profile.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Input
              label="Height (cm)"
              value={form.heightCm}
              onChange={(value) => updateField("heightCm", value)}
              icon={<Ruler size={18} />}
            />

            <Input
              label="Weight (kg)"
              value={form.weightKg}
              onChange={(value) => updateField("weightKg", value)}
              icon={<Weight size={18} />}
            />

            <ReadOnlyBox
              label="BMI Preview"
              value={bmiPreview}
              icon={<Activity size={18} />}
            />

            <Input
              label="Body Fat (%)"
              value={form.bodyFat}
              onChange={(value) => updateField("bodyFat", value)}
            />

            <Input
              label="Chest"
              value={form.chest}
              onChange={(value) => updateField("chest", value)}
            />

            <Input
              label="Waist"
              value={form.waist}
              onChange={(value) => updateField("waist", value)}
            />

            <Input
              label="Hip"
              value={form.hip}
              onChange={(value) => updateField("hip", value)}
            />

            <Input
              label="Biceps"
              value={form.biceps}
              onChange={(value) => updateField("biceps", value)}
            />

            <Input
              label="Thigh"
              value={form.thigh}
              onChange={(value) => updateField("thigh", value)}
            />
          </div>

          <div className="mt-4 min-w-0">
            <label className="mb-2 block text-sm font-bold text-zinc-400">
              Notes
            </label>

            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={4}
              className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
            />
          </div>

          {message && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-bold text-zinc-300">
              {message}
            </div>
          )}

          <button
            disabled={saving || !selectedMemberId}
            className="shine-effect mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Body Profile
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-bold text-zinc-400">
        {label}
      </label>

      <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
        {icon && <span className="shrink-0 text-zinc-500">{icon}</span>}

        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent font-semibold text-white outline-none"
        />
      </div>
    </div>
  );
}

function ReadOnlyBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-bold text-zinc-400">
        {label}
      </label>

      <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-4 text-black">
        {icon && <span className="shrink-0">{icon}</span>}
        <p className="break-words font-black">{value}</p>
      </div>
    </div>
  );
}

function ProfileBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-black text-white">{value}</p>
    </div>
  );
}