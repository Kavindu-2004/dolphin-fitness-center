"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Film,
  Loader2,
  PlayCircle,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";

type SiteVideo = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

const emptyForm = {
  title: "",
  description: "",
  isActive: true,
  priority: "1",
};

export default function AdminSiteVideosPage() {
  const [videos, setVideos] = useState<SiteVideo[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);

  async function loadVideos() {
    try {
      const res = await fetch("/api/admin/site-videos");
      const data = await res.json();

      if (Array.isArray(data)) {
        setVideos(data);
      }
    } catch {
      setMessage("Failed to load website videos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  const filteredVideos = videos.filter((video) => {
    const q = search.toLowerCase();

    const matchesSearch =
      video.title.toLowerCase().includes(q) ||
      (video.description || "").toLowerCase().includes(q);

    const matchesFilter =
      filter === "ALL" ||
      (filter === "ACTIVE" && video.isActive) ||
      (filter === "INACTIVE" && !video.isActive);

    return matchesSearch && matchesFilter;
  });

  const stats = useMemo(() => {
    return {
      total: videos.length,
      active: videos.filter((item) => item.isActive).length,
      inactive: videos.filter((item) => !item.isActive).length,
    };
  }, [videos]);

  const selectedVideoPreview = videoFile ? URL.createObjectURL(videoFile) : null;

  function updateField(name: string, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setVideoFile(null);
    setExistingVideoUrl(null);
    setEditingId("");
    setMessage("");
  }

  function startEdit(video: SiteVideo) {
    setEditingId(video.id);
    setMessage("");
    setVideoFile(null);
    setExistingVideoUrl(video.videoUrl);

    setForm({
      title: video.title,
      description: video.description || "",
      isActive: video.isActive,
      priority: String(video.priority),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveVideo(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("isActive", String(form.isActive));
      formData.append("priority", String(Number(form.priority || 1)));

      if (videoFile) {
        formData.append("video", videoFile);
      }

      const res = await fetch(
        editingId
          ? `/api/admin/site-videos/${editingId}`
          : "/api/admin/site-videos",
        {
          method: editingId ? "PUT" : "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to save video.");
        return;
      }

      setMessage(
        editingId ? "Video updated successfully." : "Video uploaded successfully."
      );

      setForm(emptyForm);
      setVideoFile(null);
      setExistingVideoUrl(null);
      setEditingId("");
      await loadVideos();
    } catch {
      setMessage("Something went wrong while saving video.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteVideo(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this website video?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/site-videos/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete video.");
        return;
      }

      setMessage("Video deleted successfully.");
      setVideos((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setMessage("Something went wrong while deleting video.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
          Admin Website Videos
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">
              Website Video Showcase
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Upload and manage the three video cards shown on the public home
              page. Active videos with higher priority will display first.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-black lg:min-w-[190px]">
            <p className="text-sm font-black text-zinc-500">Active Videos</p>
            <p className="text-3xl font-black">{stats.active}</p>
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
          icon={<Film size={22} />}
          label="Total Videos"
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
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={saveVideo}
          className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
                {editingId ? <Edit3 /> : <Plus />}
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-black sm:text-2xl">
                  {editingId ? "Edit Website Video" : "Upload Website Video"}
                </h2>
                <p className="text-sm font-semibold text-zinc-500">
                  Upload horizontal gym videos for the home page.
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
              label="Video Title"
              value={form.title}
              onChange={(value) => updateField("title", value)}
              placeholder="Example: Strength Training Zone"
            />

            <TextArea
              label="Description Optional"
              rows={4}
              value={form.description}
              onChange={(value) => updateField("description", value)}
              placeholder="Short text about this video..."
            />

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Video File {editingId ? "Optional when editing" : "Required"}
              </label>

              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-semibold text-white outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-black file:text-black sm:text-base sm:file:text-sm"
              />

              {videoFile && (
                <p className="mt-2 break-words text-sm font-bold text-zinc-500">
                  Selected: {videoFile.name}
                </p>
              )}

              {(selectedVideoPreview || existingVideoUrl) && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <video
                    src={selectedVideoPreview || existingVideoUrl || ""}
                    className="aspect-video w-full object-cover"
                    controls
                    muted
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                {editingId ? <Save size={18} /> : <Upload size={18} />}
                {editingId ? "Update Video" : "Upload Video"}
              </>
            )}
          </button>
        </form>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
              <PlayCircle />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-black sm:text-2xl">Video List</h2>
              <p className="text-sm font-semibold text-zinc-500">
                Edit, activate, deactivate, or delete home page videos.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 sm:px-5">
              <Search size={20} className="shrink-0 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search videos..."
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600 sm:text-base"
              />
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-bold text-white outline-none"
            >
              <option className="bg-black" value="ALL">
                All Status
              </option>
              <option className="bg-black" value="ACTIVE">
                Active
              </option>
              <option className="bg-black" value="INACTIVE">
                Inactive
              </option>
            </select>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400 sm:p-6">
              Loading videos...
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400 sm:p-6">
              No videos found.
            </div>
          ) : (
            <div className="mt-6 max-h-[860px] space-y-4 overflow-y-auto pr-1 sm:pr-2">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  deleting={deletingId === video.id}
                  onEdit={() => startEdit(video)}
                  onDelete={() => deleteVideo(video.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function VideoCard({
  video,
  deleting,
  onEdit,
  onDelete,
}: {
  video: SiteVideo;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4 transition duration-300 hover:bg-black/50 sm:p-5">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        <video
          src={video.videoUrl}
          className="aspect-video w-full object-cover"
          controls
          muted
        />
      </div>

      <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                video.isActive
                  ? "bg-white text-black"
                  : "border border-white/10 bg-black text-zinc-400"
              }`}
            >
              {video.isActive ? "ACTIVE" : "INACTIVE"}
            </span>

            <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-400">
              Priority {video.priority}
            </span>
          </div>

          <h3 className="mt-4 break-words text-xl font-black">{video.title}</h3>

          <p className="mt-2 break-words text-sm font-semibold leading-6 text-zinc-400">
            {video.description || "No description added."}
          </p>

          <p className="mt-4 text-xs font-bold text-zinc-600">
            Created: {new Date(video.createdAt).toLocaleDateString()}
          </p>
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