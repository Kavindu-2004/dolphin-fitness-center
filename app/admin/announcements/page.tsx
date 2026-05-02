"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit3,
  ImageIcon,
  Loader2,
  Megaphone,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

type AnnouncementType = "NOTICE" | "EVENT" | "CLOSING_DAY" | "IMPORTANT";

type Announcement = {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  imageUrl: string | null;
  eventDate: string | null;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

const emptyForm = {
  title: "",
  message: "",
  type: "NOTICE" as AnnouncementType,
  eventDate: "",
  isActive: true,
  priority: "1",
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | AnnouncementType>("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  async function loadAnnouncements() {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();

      if (Array.isArray(data)) {
        setAnnouncements(data);
      }
    } catch {
      setMessage("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter((announcement) => {
    const q = search.toLowerCase();

    const matchesSearch =
      announcement.title.toLowerCase().includes(q) ||
      announcement.message.toLowerCase().includes(q) ||
      announcement.type.toLowerCase().includes(q);

    const matchesFilter = filter === "ALL" || announcement.type === filter;

    return matchesSearch && matchesFilter;
  });

  const stats = useMemo(() => {
    return {
      total: announcements.length,
      active: announcements.filter((item) => item.isActive).length,
      closingDays: announcements.filter((item) => item.type === "CLOSING_DAY")
        .length,
      events: announcements.filter((item) => item.type === "EVENT").length,
    };
  }, [announcements]);

  const selectedImagePreview = imageFile ? URL.createObjectURL(imageFile) : null;

  function updateField(name: string, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
    setImageFile(null);
    setExistingImageUrl(null);
    setRemoveImage(false);
    setMessage("");
  }

  function startEdit(announcement: Announcement) {
    setEditingId(announcement.id);
    setMessage("");
    setImageFile(null);
    setExistingImageUrl(announcement.imageUrl);
    setRemoveImage(false);

    setForm({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      eventDate: announcement.eventDate
        ? announcement.eventDate.slice(0, 10)
        : "",
      isActive: announcement.isActive,
      priority: String(announcement.priority),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveAnnouncement(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("message", form.message);
      formData.append("type", form.type);
      formData.append("eventDate", form.eventDate);
      formData.append("isActive", String(form.isActive));
      formData.append("priority", String(Number(form.priority || 1)));
      formData.append("removeImage", String(removeImage));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(
        editingId
          ? `/api/admin/announcements/${editingId}`
          : "/api/admin/announcements",
        {
          method: editingId ? "PUT" : "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to save announcement.");
        return;
      }

      setMessage(
        editingId
          ? "Announcement updated successfully."
          : "Announcement created successfully."
      );

      setForm(emptyForm);
      setEditingId("");
      setImageFile(null);
      setExistingImageUrl(null);
      setRemoveImage(false);
      await loadAnnouncements();
    } catch {
      setMessage("Something went wrong while saving announcement.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAnnouncement(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this announcement?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete announcement.");
        return;
      }

      setMessage("Announcement deleted successfully.");
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setMessage("Something went wrong while deleting announcement.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
          Admin Announcements
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">
              Gym Notices, Events & Closing Days
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Add real-time gym announcements with optional images such as
              closing days, special events, maintenance notices, and important
              member updates.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-black lg:min-w-[190px]">
            <p className="text-sm font-black text-zinc-500">Active Notices</p>
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
          icon={<Megaphone size={22} />}
          label="Total"
          value={stats.total.toString()}
        />
        <SummaryCard
          icon={<CheckCircle2 size={22} />}
          label="Active"
          value={stats.active.toString()}
        />
        <SummaryCard
          icon={<AlertTriangle size={22} />}
          label="Closing Days"
          value={stats.closingDays.toString()}
        />
        <SummaryCard
          icon={<CalendarClock size={22} />}
          label="Events"
          value={stats.events.toString()}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={saveAnnouncement}
          className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
                {editingId ? <Edit3 /> : <Plus />}
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-black sm:text-2xl">
                  {editingId ? "Edit Announcement" : "Add Announcement"}
                </h2>
                <p className="text-sm font-semibold text-zinc-500">
                  Active announcements appear on the public home page.
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
              label="Title"
              value={form.title}
              onChange={(value) => updateField("title", value)}
              placeholder="Example: Gym closed on Monday"
            />

            <TextArea
              label="Message"
              required
              rows={5}
              value={form.message}
              onChange={(value) => updateField("message", value)}
              placeholder="Write the full announcement message here..."
            />

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Announcement Image Optional
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setImageFile(e.target.files?.[0] || null);
                  setRemoveImage(false);
                }}
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-semibold text-white outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-black file:text-black sm:text-base sm:file:text-sm"
              />

              {(selectedImagePreview || existingImageUrl) && !removeImage && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                  <img
                    src={selectedImagePreview || existingImageUrl || ""}
                    alt="Announcement preview"
                    className="h-44 w-full object-cover sm:h-48"
                  />
                </div>
              )}

              {editingId && existingImageUrl && !imageFile && (
                <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-zinc-300">
                      Remove Current Image
                    </p>
                    <p className="mt-1 text-xs font-bold text-zinc-600">
                      Tick this only if you want to remove the existing image.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => setRemoveImage(e.target.checked)}
                    className="h-5 w-5 shrink-0 accent-white"
                  />
                </label>
              )}

              {imageFile && (
                <p className="mt-2 break-words text-sm font-bold text-zinc-500">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Type">
                <select
                  value={form.type}
                  onChange={(e) =>
                    updateField("type", e.target.value as AnnouncementType)
                  }
                  className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
                >
                  <option className="bg-black" value="NOTICE">
                    Notice
                  </option>
                  <option className="bg-black" value="EVENT">
                    Event
                  </option>
                  <option className="bg-black" value="CLOSING_DAY">
                    Closing Day
                  </option>
                  <option className="bg-black" value="IMPORTANT">
                    Important
                  </option>
                </select>
              </FormField>

              <Input
                label="Event / Notice Date"
                type="date"
                value={form.eventDate}
                onChange={(value) => updateField("eventDate", value)}
                required={false}
              />

              <FormField label="Priority">
                <select
                  value={form.priority}
                  onChange={(e) => updateField("priority", e.target.value)}
                  className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
                >
                  <option className="bg-black" value="1">
                    1 - Normal
                  </option>
                  <option className="bg-black" value="2">
                    2 - Medium
                  </option>
                  <option className="bg-black" value="3">
                    3 - High
                  </option>
                  <option className="bg-black" value="4">
                    4 - Very High
                  </option>
                  <option className="bg-black" value="5">
                    5 - Top Priority
                  </option>
                </select>
              </FormField>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-400">Status</p>
                  <p className="mt-1 break-words font-black">
                    {form.isActive ? "Active" : "Inactive"}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => updateField("isActive", e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-white"
                />
              </label>
            </div>
          </div>

          <button
            disabled={saving}
            className="shine-effect mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:scale-[1.02] disabled:opacity-60 sm:text-base"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {editingId ? "Update Announcement" : "Create Announcement"}
              </>
            )}
          </button>
        </form>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
              <BellRing />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-black sm:text-2xl">
                Announcement List
              </h2>
              <p className="text-sm font-semibold text-zinc-500">
                Edit, activate, deactivate, or delete gym notices.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 sm:px-5">
              <Search size={20} className="shrink-0 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search announcements..."
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600 sm:text-base"
              />
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as "ALL" | AnnouncementType)
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-bold text-white outline-none"
            >
              <option className="bg-black" value="ALL">
                All Types
              </option>
              <option className="bg-black" value="NOTICE">
                Notice
              </option>
              <option className="bg-black" value="EVENT">
                Event
              </option>
              <option className="bg-black" value="CLOSING_DAY">
                Closing Day
              </option>
              <option className="bg-black" value="IMPORTANT">
                Important
              </option>
            </select>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400 sm:p-6">
              Loading announcements...
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400 sm:p-6">
              No announcements found.
            </div>
          ) : (
            <div className="mt-6 max-h-[860px] space-y-4 overflow-y-auto pr-1 sm:pr-2">
              {filteredAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  deleting={deletingId === announcement.id}
                  onEdit={() => startEdit(announcement)}
                  onDelete={() => deleteAnnouncement(announcement.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AnnouncementCard({
  announcement,
  deleting,
  onEdit,
  onDelete,
}: {
  announcement: Announcement;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4 transition duration-300 hover:bg-black/50 sm:p-5">
      {announcement.imageUrl && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <img
            src={announcement.imageUrl}
            alt={announcement.title}
            className="h-40 w-full object-cover sm:h-44"
          />
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={announcement.type} />

            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                announcement.isActive
                  ? "bg-white text-black"
                  : "border border-white/10 bg-black text-zinc-400"
              }`}
            >
              {announcement.isActive ? "ACTIVE" : "INACTIVE"}
            </span>

            <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-400">
              Priority {announcement.priority}
            </span>

            {announcement.imageUrl && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-400">
                <ImageIcon size={14} />
                IMAGE
              </span>
            )}
          </div>

          <h3 className="mt-4 break-words text-xl font-black">
            {announcement.title}
          </h3>

          <p className="mt-2 break-words text-sm font-semibold leading-6 text-zinc-400">
            {announcement.message}
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-zinc-600">
            <span>
              Created: {new Date(announcement.createdAt).toLocaleDateString()}
            </span>

            {announcement.eventDate && (
              <span>
                Date: {new Date(announcement.eventDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="grid w-full gap-2 md:w-[180px] md:shrink-0">
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

function TypeBadge({ type }: { type: AnnouncementType }) {
  const icon =
    type === "EVENT" ? (
      <CalendarClock size={14} />
    ) : type === "CLOSING_DAY" ? (
      <X size={14} />
    ) : type === "IMPORTANT" ? (
      <AlertTriangle size={14} />
    ) : (
      <Clock size={14} />
    );

  const label =
    type === "EVENT"
      ? "EVENT"
      : type === "CLOSING_DAY"
      ? "CLOSING DAY"
      : type === "IMPORTANT"
      ? "IMPORTANT"
      : "NOTICE";

  const className =
    type === "CLOSING_DAY"
      ? "bg-red-500 text-white"
      : type === "IMPORTANT"
      ? "bg-white text-black"
      : "border border-white/10 bg-black text-white";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${className}`}
    >
      {icon}
      {label}
    </span>
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
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <FormField label={label}>
      <input
        required={required}
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
  required = false,
}: {
  label: string;
  rows: number;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <FormField label={label}>
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
      />
    </FormField>
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