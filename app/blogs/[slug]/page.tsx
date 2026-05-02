import Link from "next/link";
import { notFound } from "next/navigation";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  CalendarDays,
  Dumbbell,
  ImageIcon,
  Star,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getBlog(slug: string) {
  const blog = await prisma.blogPost.findFirst({
    where: {
      slug,
      isPublished: true,
    },
  });

  return blog;
}

export default async function SingleBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const paragraphs = blog.content
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <PublicNavbar />

      <section className="relative px-6 py-16">
        <div className="pointer-events-none fixed inset-0">
          <div className="animate-glow-pulse absolute left-[-10%] top-[-20%] h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
          <div className="animate-float-slow absolute right-[-10%] bottom-[-20%] h-[520px] w-[520px] rounded-full bg-zinc-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black text-zinc-300 transition hover:bg-white hover:text-black"
          >
            <ArrowLeft size={17} />
            Back to Blogs
          </Link>

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black">
                <Dumbbell size={15} />
                Fitness Blog
              </div>

              {blog.isFeatured && (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white">
                  <Star size={15} />
                  Featured
                </div>
              )}

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                <CalendarDays size={15} />
                {new Date(blog.createdAt).toLocaleDateString()}
              </div>
            </div>

            <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight md:text-7xl">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="mt-6 max-w-3xl text-lg font-semibold leading-8 text-zinc-400">
                {blog.excerpt}
              </p>
            )}
          </div>

          <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">
            {blog.coverImage ? (
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="max-h-[520px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[360px] w-full items-center justify-center bg-white text-black">
                <ImageIcon size={70} />
              </div>
            )}
          </div>

          <article className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl md:p-10">
            <div className="space-y-6 text-base font-semibold leading-8 text-zinc-300 md:text-lg md:leading-9">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>

          <div className="mt-10 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Ready to train with us?</h2>
              <p className="mt-2 text-sm font-semibold text-zinc-500">
                Join Dolphin Fitness Center and start your fitness journey with
                smart payment tracking, body profile updates, and coach support.
              </p>
            </div>

            <Link
              href="/register"
              className="shine-effect inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-black text-black transition hover:scale-[1.02]"
            >
              Start Membership
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}