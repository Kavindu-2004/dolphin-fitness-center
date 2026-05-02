"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Camera,
  Dumbbell,
  Loader2,
  Mail,
  Phone,
  Save,
  Search,
  Star,
  UserRound,
  Users,
} from "lucide-react";

type Coach = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  specialty: string;
  experience: string;
  description: string | null;
  image: string | null;
  subscriptions: {
    id: string;
    status: string;
    type: "NORMAL_MONTHLY" | "PERSONAL_TRAINING";
    totalMonthlyFee: number;
    member: {
      id: string;
      memberNo: string;
      age: number | null;
      user: {
        name: string;
        email: string;
        phone: string;
      };
    };
  }[];
};

type CoachEditForm = {
  name: string;
  phone: string;
  email: string;
  specialty: string;
  experience: string;
  description: string;
};

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingCoachId, setEditingCoachId] = useState("");
  const [savingCoachId, setSavingCoachId] = useState("");
  const [message, setMessage] = useState("");
  const [coachImage, setCoachImage] = useState<File | null>(null);

  const [editForm, setEditForm] = useState<CoachEditForm>({
    name: "",
    phone: "",
    email: "",
    specialty: "",
    experience: "",
    description: "",
  });

  async function loadCoaches() {
    try {
      const res = await fetch("/api/admin/coaches");
      const data = await res.json();

      if (Array.isArray(data)) {
        setCoaches(data);
      }
    } catch (error) {
      console.error("LOAD_COACHES_ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoaches();
  }, []);

  const filteredCoaches = coaches.filter((coach) => {
    const q = search.toLowerCase();

    return (
      coach.name.toLowerCase().includes(q) ||
      coach.specialty.toLowerCase().includes(q) ||
      coach.phone.toLowerCase().includes(q) ||
      (coach.email || "").toLowerCase().includes(q)
    );
  });

  const totalAssignedClients = useMemo(() => {
    return coaches.reduce((sum, coach) => {
      return sum + coach.subscriptions.length;
    }, 0);
  }, [coaches]);

  function startEdit(coach: Coach) {
    setEditingCoachId(coach.id);
    setCoachImage(null);
    setMessage("");

    setEditForm({
      name: coach.name,
      phone: coach.phone,
      email: coach.email || "",
      specialty: coach.specialty,
      experience: coach.experience,
      description: coach.description || "",
    });
  }

  function cancelEdit() {
    setEditingCoachId("");
    setCoachImage(null);
    setMessage("");
    setEditForm({
      name: "",
      phone: "",
      email: "",
      specialty: "",
      experience: "",
      description: "",
    });
  }

  function updateEditField(name: string, value: string) {
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveCoachUpdate(coachId: string) {
    setSavingCoachId(coachId);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("name", editForm.name);
      formData.append("phone", editForm.phone);
      formData.append("email", editForm.email);
      formData.append("specialty", editForm.specialty);
      formData.append("experience", editForm.experience);
      formData.append("description", editForm.description);

      if (coachImage) {
        formData.append("image", coachImage);
      }

      const res = await fetch(`/api/admin/coaches/${coachId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to update coach.");
        return;
      }

      setMessage("Coach profile updated successfully.");
      setEditingCoachId("");
      setCoachImage(null);
      await loadCoaches();
    } catch {
      setMessage("Something went wrong while updating coach.");
    } finally {
      setSavingCoachId("");
    }
  }

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
          Admin Coaches
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">
              Coach Management
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              View gym coaches, upload coach profile pictures, update contact
              details, and manage coach information shown on the website.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-black lg:min-w-[210px]">
            <p className="text-sm font-black text-zinc-500">
              Assigned Clients
            </p>
            <p className="text-3xl font-black">{totalAssignedClients}</p>
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
          icon={<Dumbbell size={22} />}
          label="Total Coaches"
          value={coaches.length.toString()}
        />
        <SummaryCard
          icon={<Users size={22} />}
          label="PT Clients"
          value={totalAssignedClients.toString()}
        />
        <SummaryCard
          icon={<Award size={22} />}
          label="Monthly PT Fee"
          value="LKR 15,000"
        />
      </section>

      <div className="mt-6 flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 sm:px-5">
        <Search size={20} className="shrink-0 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coaches..."
          className="w-full min-w-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600 sm:text-base"
        />
      </div>

      {loading ? (
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
          Loading coaches...
        </div>
      ) : filteredCoaches.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-400 sm:p-8">
          No coaches found.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredCoaches.map((coach) => (
            <CoachCard
              key={coach.id}
              coach={coach}
              editing={editingCoachId === coach.id}
              saving={savingCoachId === coach.id}
              editForm={editForm}
              selectedImage={coachImage}
              onStartEdit={() => startEdit(coach)}
              onCancelEdit={cancelEdit}
              onUpdateField={updateEditField}
              onSelectImage={setCoachImage}
              onSave={() => saveCoachUpdate(coach.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CoachCard({
  coach,
  editing,
  saving,
  editForm,
  selectedImage,
  onStartEdit,
  onCancelEdit,
  onUpdateField,
  onSelectImage,
  onSave,
}: {
  coach: Coach;
  editing: boolean;
  saving: boolean;
  editForm: CoachEditForm;
  selectedImage: File | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdateField: (name: string, value: string) => void;
  onSelectImage: (file: File | null) => void;
  onSave: () => void;
}) {
  return (
    <div className="shine-effect min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/[0.09] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl bg-white text-black">
          {coach.image ? (
            <img
              src={coach.image}
              alt={coach.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Dumbbell size={32} />
            </div>
          )}
        </div>

        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-black">
          {coach.subscriptions.length} Clients
        </span>
      </div>

      {!editing ? (
        <>
          <h2 className="mt-6 break-words text-2xl font-black">
            {coach.name}
          </h2>

          <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-black text-zinc-300">
            <Star size={16} className="shrink-0" />
            <span className="truncate">{coach.specialty}</span>
          </div>

          <p className="mt-4 text-sm leading-6 text-zinc-400">
            {coach.description || "No description added."}
          </p>

          <div className="mt-6 grid gap-3">
            <Info icon={<Phone size={17} />} text={coach.phone} />
            <Info icon={<Mail size={17} />} text={coach.email || "No email"} />
            <Info icon={<Award size={17} />} text={coach.experience} />
          </div>

          <button
            type="button"
            onClick={onStartEdit}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02]"
          >
            <Camera size={17} />
            Edit Coach Profile
          </button>
        </>
      ) : (
        <div className="mt-6">
          <h2 className="text-2xl font-black">Edit Coach</h2>

          <div className="mt-5 grid gap-4">
            <CoachInput
              label="Coach Name"
              value={editForm.name}
              onChange={(value) => onUpdateField("name", value)}
            />

            <CoachInput
              label="Phone"
              value={editForm.phone}
              onChange={(value) => onUpdateField("phone", value)}
            />

            <CoachInput
              label="Email"
              value={editForm.email}
              onChange={(value) => onUpdateField("email", value)}
            />

            <CoachInput
              label="Specialty"
              value={editForm.specialty}
              onChange={(value) => onUpdateField("specialty", value)}
            />

            <CoachInput
              label="Experience"
              value={editForm.experience}
              onChange={(value) => onUpdateField("experience", value)}
            />

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Description
              </label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) => onUpdateField("description", e.target.value)}
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
              />
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Coach Profile Picture
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => onSelectImage(e.target.files?.[0] || null)}
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-semibold text-white outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-black file:text-black sm:text-base sm:file:text-sm"
              />

              {selectedImage && (
                <p className="mt-2 break-words text-sm font-bold text-zinc-500">
                  Selected: {selectedImage.name}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-black/50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="shine-effect flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={17} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Coach
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-white p-4 text-black">
        <p className="text-sm font-black text-zinc-500">Assigned Members</p>

        {coach.subscriptions.length === 0 ? (
          <p className="mt-2 text-sm font-bold text-zinc-500">
            No personal training clients yet.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {coach.subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex flex-col gap-3 rounded-2xl bg-zinc-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <UserRound size={18} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                      {subscription.member.user.name}
                    </p>
                    <p className="truncate text-xs font-bold text-zinc-500">
                      {subscription.member.memberNo}
                    </p>
                  </div>
                </div>

                <span className="w-fit shrink-0 rounded-full bg-black px-3 py-1 text-xs font-black text-white">
                  {subscription.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoachInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-bold text-zinc-400">
        {label}
      </label>

      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
      />
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