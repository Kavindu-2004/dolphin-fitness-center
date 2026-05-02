"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Edit3,
  FileText,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  isPublished: true,
  isFeatured: false,
  priority: "1",
  removeCoverImage: false,
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "PUBLISHED" | "DRAFT" | "FEATURED"
  >("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [existingCoverImage, setExistingCoverImage] = useState<string | null>(
    null
  );

  async function loadBlogs() {
    try {
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();

      if (Array.isArray(data)) {
        setBlogs(data);
      }
    } catch {
      setMessage("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) => {
    const q = search.toLowerCase();

    const matchesSearch =
      blog.title.toLowerCase().includes(q) ||
      blog.slug.toLowerCase().includes(q) ||
      (blog.excerpt || "").toLowerCase().includes(q) ||
      blog.content.toLowerCase().includes(q);

    const matchesFilter =
      filter === "ALL" ||
      (filter === "PUBLISHED" && blog.isPublished) ||
      (filter === "DRAFT" && !blog.isPublished) ||
      (filter === "FEATURED" && blog.isFeatured);

    return matchesSearch && matchesFilter;
  });

  const stats = useMemo(() => {
    return {
      total: blogs.length,
      published: blogs.filter((item) => item.isPublished).length,
      draft: blogs.filter((item) => !item.isPublished).length,
      featured: blogs.filter((item) => item.isFeatured).length,
    };
  }, [blogs]);

  const coverPreview = coverImageFile
    ? URL.createObjectURL(coverImageFile)
    : existingCoverImage;

  function updateField(name: string, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setCoverImageFile(null);
    setExistingCoverImage(null);
    setEditingId("");
    setMessage("");
  }

  function startEdit(blog: BlogPost) {
    setEditingId(blog.id);
    setMessage("");
    setCoverImageFile(null);
    setExistingCoverImage(blog.coverImage);

    setForm({
      title: blog.title,
      excerpt: blog.excerpt || "",
      content: blog.content,
      isPublished: blog.isPublished,
      isFeatured: blog.isFeatured,
      priority: String(blog.priority),
      removeCoverImage: false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveBlog(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("excerpt", form.excerpt);
      formData.append("content", form.content);
      formData.append("isPublished", String(form.isPublished));
      formData.append("isFeatured", String(form.isFeatured));
      formData.append("priority", String(Number(form.priority || 1)));
      formData.append("removeCoverImage", String(form.removeCoverImage));

      if (coverImageFile) {
        formData.append("coverImage", coverImageFile);
      }

      const res = await fetch(
        editingId ? `/api/admin/blogs/${editingId}` : "/api/admin/blogs",
        {
          method: editingId ? "PUT" : "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to save blog.");
        return;
      }

      setMessage(
        editingId ? "Blog updated successfully." : "Blog created successfully."
      );

      setForm(emptyForm);
      setCoverImageFile(null);
      setExistingCoverImage(null);
      setEditingId("");
      await loadBlogs();
    } catch {
      setMessage("Something went wrong while saving blog.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBlog(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this blog?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete blog.");
        return;
      }

      setMessage("Blog deleted successfully.");
      setBlogs((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setMessage("Something went wrong while deleting blog.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="animate-slide-up w-full max-w-full overflow-hidden">
      <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 sm:text-sm">
          Admin Blogs
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">
              Gym Blog Management
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Create fitness articles, gym updates, training tips, nutrition
              guides, and member education posts for the public website.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-black lg:min-w-[190px]">
            <p className="text-sm font-black text-zinc-500">Published Blogs</p>
            <p className="text-3xl font-black">{stats.published}</p>
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
          icon={<BookOpen size={22} />}
          label="Total Blogs"
          value={stats.total.toString()}
        />
        <SummaryCard
          icon={<CheckCircle2 size={22} />}
          label="Published"
          value={stats.published.toString()}
        />
        <SummaryCard
          icon={<XCircle size={22} />}
          label="Drafts"
          value={stats.draft.toString()}
        />
        <SummaryCard
          icon={<Star size={22} />}
          label="Featured"
          value={stats.featured.toString()}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={saveBlog}
          className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
                {editingId ? <Edit3 /> : <Plus />}
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-black sm:text-2xl">
                  {editingId ? "Edit Blog" : "Create Blog"}
                </h2>
                <p className="text-sm font-semibold text-zinc-500">
                  Published blogs appear on the public blogs page.
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
              label="Blog Title"
              value={form.title}
              onChange={(value) => updateField("title", value)}
              placeholder="Example: 5 Tips to Build Strength Safely"
            />

            <TextArea
              label="Short Excerpt Optional"
              rows={3}
              value={form.excerpt}
              onChange={(value) => updateField("excerpt", value)}
              placeholder="Short summary shown on blog cards..."
            />

            <TextArea
              label="Full Blog Content"
              required
              rows={10}
              value={form.content}
              onChange={(value) => updateField("content", value)}
              placeholder="Write full blog content here..."
            />

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Cover Image Optional
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setCoverImageFile(e.target.files?.[0] || null);
                  updateField("removeCoverImage", false);
                }}
                className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-semibold text-white outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-black file:text-black sm:text-base sm:file:text-sm"
              />

              {coverPreview && !form.removeCoverImage && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <img
                    src={coverPreview}
                    alt="Blog cover preview"
                    className="aspect-video w-full object-cover"
                  />
                </div>
              )}

              {editingId && existingCoverImage && (
                <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <span className="text-sm font-bold text-zinc-400">
                    Remove current cover image
                  </span>
                  <input
                    type="checkbox"
                    checked={form.removeCoverImage}
                    onChange={(e) =>
                      updateField("removeCoverImage", e.target.checked)
                    }
                    className="h-5 w-5 shrink-0 accent-white"
                  />
                </label>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
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

              <ToggleBox
                title="Published"
                subtitle={form.isPublished ? "Yes" : "Draft"}
                checked={form.isPublished}
                onChange={(checked) => updateField("isPublished", checked)}
              />

              <ToggleBox
                title="Featured"
                subtitle={form.isFeatured ? "Yes" : "No"}
                checked={form.isFeatured}
                onChange={(checked) => updateField("isFeatured", checked)}
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
                Saving...
              </>
            ) : (
              <>
                {editingId ? <Save size={18} /> : <Upload size={18} />}
                {editingId ? "Update Blog" : "Create Blog"}
              </>
            )}
          </button>
        </form>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
              <FileText />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-black sm:text-2xl">Blog List</h2>
              <p className="text-sm font-semibold text-zinc-500">
                Edit, publish, unpublish, feature, or delete blog articles.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 sm:px-5">
              <Search size={20} className="shrink-0 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blogs..."
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600 sm:text-base"
              />
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value as
                    | "ALL"
                    | "PUBLISHED"
                    | "DRAFT"
                    | "FEATURED"
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-bold text-white outline-none"
            >
              <option className="bg-black" value="ALL">
                All Blogs
              </option>
              <option className="bg-black" value="PUBLISHED">
                Published
              </option>
              <option className="bg-black" value="DRAFT">
                Drafts
              </option>
              <option className="bg-black" value="FEATURED">
                Featured
              </option>
            </select>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400 sm:p-6">
              Loading blogs...
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-400 sm:p-6">
              No blogs found.
            </div>
          ) : (
            <div className="mt-6 max-h-[900px] space-y-4 overflow-y-auto pr-1 sm:pr-2">
              {filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  deleting={deletingId === blog.id}
                  onEdit={() => startEdit(blog)}
                  onDelete={() => deleteBlog(blog.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function BlogCard({
  blog,
  deleting,
  onEdit,
  onDelete,
}: {
  blog: BlogPost;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4 transition duration-300 hover:bg-black/50 sm:p-5">
      {blog.coverImage ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="aspect-video w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-zinc-600">
          <ImageIcon size={42} />
        </div>
      )}

      <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                blog.isPublished
                  ? "bg-white text-black"
                  : "border border-white/10 bg-black text-zinc-400"
              }`}
            >
              {blog.isPublished ? "PUBLISHED" : "DRAFT"}
            </span>

            {blog.isFeatured && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                FEATURED
              </span>
            )}

            <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-400">
              Priority {blog.priority}
            </span>
          </div>

          <h3 className="mt-4 break-words text-xl font-black">{blog.title}</h3>

          <p className="mt-1 break-all text-xs font-bold text-zinc-600">
            /{blog.slug}
          </p>

          <p className="mt-3 line-clamp-3 break-words text-sm font-semibold leading-6 text-zinc-400">
            {blog.excerpt || blog.content}
          </p>

          <p className="mt-4 text-xs font-bold text-zinc-600">
            Created: {new Date(blog.createdAt).toLocaleDateString()}
          </p>
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

function ToggleBox({
  title,
  subtitle,
  checked,
  onChange,
}: {
  title: string;
  subtitle: string;
  checked: boolean;
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
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-white"
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