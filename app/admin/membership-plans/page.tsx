"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Crown,
  Dumbbell,
  Edit3,
  Loader2,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";

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
  createdAt: string;
  updatedAt: string;
};

const emptyForm = {
  name: "",
  description: "",
  monthlyFee: "",
  features: "",
  isActive: true,
  isPersonalTraining: false,
  requiresCoach: false,
  priority: "1",
};

export default function AdminMembershipPlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE" | "PERSONAL_TRAINING"
  >("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);

  async function loadPlans() {
    try {
      const res = await fetch("/api/admin/membership-plans");
      const data = await res.json();

      if (Array.isArray(data)) {
        setPlans(data);
      }
    } catch {
      setMessage("Failed to load membership plans.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => {
    const q = search.toLowerCase();

    const matchesSearch =
      plan.name.toLowerCase().includes(q) ||
      plan.slug.toLowerCase().includes(q) ||
      (plan.description || "").toLowerCase().includes(q) ||
      (plan.features || "").toLowerCase().includes(q);

    const matchesFilter =
      filter === "ALL" ||
      (filter === "ACTIVE" && plan.isActive) ||
      (filter === "INACTIVE" && !plan.isActive) ||
      (filter === "PERSONAL_TRAINING" && plan.isPersonalTraining);

    return matchesSearch && matchesFilter;
  });

  const stats = useMemo(() => {
    return {
      total: plans.length,
      active: plans.filter((item) => item.isActive).length,
      inactive: plans.filter((item) => !item.isActive).length,
      personalTraining: plans.filter((item) => item.isPersonalTraining).length,
    };
  }, [plans]);

  function updateField(name: string, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
    setMessage("");
  }

  function startEdit(plan: MembershipPlan) {
    setEditingId(plan.id);
    setMessage("");

    setForm({
      name: plan.name,
      description: plan.description || "",
      monthlyFee: String(plan.monthlyFee),
      features: plan.features || "",
      isActive: plan.isActive,
      isPersonalTraining: plan.isPersonalTraining,
      requiresCoach: plan.requiresCoach,
      priority: String(plan.priority),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function savePlan(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        name: form.name,
        description: form.description,
        monthlyFee: Number(form.monthlyFee || 0),
        features: form.features,
        isActive: form.isActive,
        isPersonalTraining: form.isPersonalTraining,
        requiresCoach: form.requiresCoach,
        priority: Number(form.priority || 1),
      };

      const res = await fetch(
        editingId
          ? `/api/admin/membership-plans/${editingId}`
          : "/api/admin/membership-plans",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to save membership plan.");
        return;
      }

      setMessage(
        editingId
          ? "Membership plan updated successfully."
          : "Membership plan created successfully."
      );

      setForm(emptyForm);
      setEditingId("");
      await loadPlans();
    } catch {
      setMessage("Something went wrong while saving membership plan.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePlan(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this membership plan?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/membership-plans/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete membership plan.");
        return;
      }

      setMessage("Membership plan deleted successfully.");
      setPlans((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setMessage("Something went wrong while deleting membership plan.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
          Admin Membership Plans
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">
              Subscription Plan Control
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Manage Silver, Gold, Platinum, and Diamond memberships. Prices and
              plan details update on the website automatically.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-black lg:min-w-[190px]">
            <p className="text-sm font-black text-zinc-500">Active Plans</p>
            <p className="text-3xl font-black">{stats.active}</p>
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
          icon={<Crown size={22} />}
          label="Total Plans"
          value={stats.total.toString()}
        />
        <SummaryCard
          icon={<CheckCircle2 size={22} />}
          label="Active"
          value={stats.active.toString()}
        />
        <SummaryCard
          icon={<XCircle size={22} />}
          label="Inactive"
          value={stats.inactive.toString()}
        />
        <SummaryCard
          icon={<Dumbbell size={22} />}
          label="PT Plans"
          value={stats.personalTraining.toString()}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={savePlan}
          className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
                {editingId ? <Edit3 /> : <Plus />}
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-black sm:text-2xl">
                  {editingId ? "Edit Plan" : "Create Plan"}
                </h2>
                <p className="text-sm font-semibold text-zinc-500">
                  Active plans appear on registration and public website.
                </p>
              </div>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-black text-white transition hover:bg-black/50 sm:w-fit"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4">
            <Input
              label="Plan Name"
              value={form.name}
              onChange={(value) => updateField("name", value)}
              placeholder="Example: Diamond Membership"
              type="text"
            />

            <Input
              label="Monthly Fee"
              value={form.monthlyFee}
              onChange={(value) => updateField("monthlyFee", value)}
              placeholder="Example: 15000"
              type="number"
            />

            <TextArea
              label="Description"
              rows={3}
              value={form.description}
              onChange={(value) => updateField("description", value)}
              placeholder="Short description about this membership plan..."
            />

            <TextArea
              label="Features One Per Line"
              rows={7}
              value={form.features}
              onChange={(value) => updateField("features", value)}
              placeholder={"Monthly gym access\nBody profile tracking\nCoach selection"}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Display Priority">
                <select
                  value={form.priority}
                  onChange={(e) => updateField("priority", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
                >
                  <option className="bg-black" value="1">
                    1 - First
                  </option>
                  <option className="bg-black" value="2">
                    2
                  </option>
                  <option className="bg-black" value="3">
                    3
                  </option>
                  <option className="bg-black" value="4">
                    4
                  </option>
                  <option className="bg-black" value="5">
                    5
                  </option>
                  <option className="bg-black" value="10">
                    10 - Highest
                  </option>
                </select>
              </FormField>

              <ToggleBox
                title="Active"
                subtitle={form.isActive ? "Visible" : "Hidden"}
                checked={form.isActive}
                onChange={(checked) => updateField("isActive", checked)}
              />

              <ToggleBox
                title="Personal Training"
                subtitle={form.isPersonalTraining ? "Yes" : "No"}
                checked={form.isPersonalTraining}
                onChange={(checked) => {
                  updateField("isPersonalTraining", checked);

                  if (!checked) {
                    updateField("requiresCoach", false);
                  }
                }}
              />

              <ToggleBox
                title="Requires Coach"
                subtitle={form.requiresCoach ? "Yes" : "No"}
                checked={form.requiresCoach}
                disabled={!form.isPersonalTraining}
                onChange={(checked) => updateField("requiresCoach", checked)}
              />
            </div>
          </div>

          <button
            disabled={saving}
            className="shine-effect mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:scale-[1.02] disabled:opacity-60 sm:text-base"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving Plan...
              </>
            ) : (
              <>
                <Save size={18} />
                {editingId ? "Update Plan" : "Create Plan"}
              </>
            )}
          </button>
        </form>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
              <ShieldCheck />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-black sm:text-2xl">Plan List</h2>
              <p className="text-sm font-semibold text-zinc-500">
                Edit membership prices, features, and Diamond coach requirement.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_240px]">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 sm:px-5">
              <Search size={20} className="shrink-0 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plans..."
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600 sm:text-base"
              />
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value as
                    | "ALL"
                    | "ACTIVE"
                    | "INACTIVE"
                    | "PERSONAL_TRAINING"
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-bold text-white outline-none"
            >
              <option className="bg-black" value="ALL">
                All Plans
              </option>
              <option className="bg-black" value="ACTIVE">
                Active
              </option>
              <option className="bg-black" value="INACTIVE">
                Inactive
              </option>
              <option className="bg-black" value="PERSONAL_TRAINING">
                Personal Training
              </option>
            </select>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400 sm:p-6">
              Loading membership plans...
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400 sm:p-6">
              No membership plans found.
            </div>
          ) : (
            <div className="mt-6 max-h-[860px] space-y-4 overflow-y-auto pr-1 sm:pr-2">
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  deleting={deletingId === plan.id}
                  onEdit={() => startEdit(plan)}
                  onDelete={() => deletePlan(plan.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PlanCard({
  plan,
  deleting,
  onEdit,
  onDelete,
}: {
  plan: MembershipPlan;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const features = (plan.features || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4 transition duration-300 hover:bg-black/50 sm:p-5">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                plan.isActive
                  ? "bg-white text-black"
                  : "border border-white/10 bg-black text-zinc-400"
              }`}
            >
              {plan.isActive ? "ACTIVE" : "INACTIVE"}
            </span>

            {plan.isPersonalTraining && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                <Dumbbell size={13} />
                PERSONAL TRAINING
              </span>
            )}

            {plan.requiresCoach && (
              <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-400">
                COACH REQUIRED
              </span>
            )}

            <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-400">
              Priority {plan.priority}
            </span>
          </div>

          <h3 className="mt-4 break-words text-xl font-black sm:text-2xl">
            {plan.name}
          </h3>

          <p className="mt-1 break-all text-xs font-bold text-zinc-600">
            /{plan.slug}
          </p>

          <p className="mt-3 break-words text-2xl font-black sm:text-3xl">
            LKR {plan.monthlyFee.toLocaleString()}
            <span className="text-sm font-bold text-zinc-500"> / month</span>
          </p>

          {plan.description && (
            <p className="mt-3 text-sm font-semibold leading-6 text-zinc-400">
              {plan.description}
            </p>
          )}

          {features.length > 0 && (
            <div className="mt-4 grid gap-2">
              {features.slice(0, 5).map((feature) => (
                <div
                  key={feature}
                  className="flex min-w-0 items-center gap-2 text-sm font-bold text-zinc-400"
                >
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span className="break-words">{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid w-full gap-2 md:w-[170px] md:shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-black transition hover:scale-[1.02] md:py-2"
          >
            <Edit3 size={15} />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-3 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-red-600 disabled:opacity-60 md:py-2"
          >
            {deleting ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <Trash2 size={15} />
            )}
            Delete
          </button>
        </div>
      </div>
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

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <FormField label={label}>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
      />
    </FormField>
  );
}

function TextArea({
  label,
  rows,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  rows: number;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <FormField label={label}>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
      />
    </FormField>
  );
}

function ToggleBox({
  title,
  subtitle,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  subtitle: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-bold text-zinc-400">{title}</p>
        <p className="mt-1 break-words font-black">{subtitle}</p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-white disabled:opacity-40"
      />
    </label>
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