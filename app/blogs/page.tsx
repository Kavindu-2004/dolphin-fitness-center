import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  CalendarDays,
  ImageIcon,
  Star,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getBlogs() {
  const blogs = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      {
        isFeatured: "desc",
      },
      {
        priority: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return blogs;
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <PublicNavbar />

      <section className="relative px-4 py-12 sm:px-6 sm:py-16">
        <div className="pointer-events-none fixed inset-0">
          <div className="animate-glow-pulse absolute left-[-30%] top-[-20%] h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl sm:left-[-10%] sm:h-[520px] sm:w-[520px]" />
          <div className="animate-float-slow absolute bottom-[-20%] right-[-30%] h-[360px] w-[360px] rounded-full bg-zinc-500/20 blur-3xl sm:right-[-10%] sm:h-[520px] sm:w-[520px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="animate-slide-up">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 sm:text-sm sm:tracking-[0.3em]">
              Gym Articles
            </p>

            <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
                  Fitness Blogs
                </h1>

                <p className="mt-5 max-w-2xl break-words text-sm leading-6 text-zinc-400 sm:text-lg sm:leading-8">
                  Read gym updates, workout tips, nutrition guidance, training
                  advice, and fitness education from Dolphin Fitness Center.
                </p>
              </div>

              <Link
                href="/register"
                className="shine-effect inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-black text-black transition hover:bg-zinc-200 sm:w-fit sm:text-base sm:hover:scale-[1.02]"
              >
                Start Membership <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {blogs.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-sm text-zinc-400 sm:p-8">
              No blogs published yet. Add blogs from the admin dashboard.
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:mt-12 md:grid-cols-2 xl:grid-cols-3">
              {blogs.map((blog, index) => (
                <Link
                  key={blog.id}
                  href={`/blogs/${blog.slug}`}
                  className="shine-effect group min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl transition duration-300 hover:bg-white/[0.09] sm:hover:-translate-y-3"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="relative aspect-video overflow-hidden bg-black">
                    {blog.coverImage ? (
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white text-black">
                        <ImageIcon size={46} />
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    {blog.isFeatured && (
                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                        <Star size={14} />
                        Featured
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="line-clamp-2 break-words text-xl font-black text-white sm:text-2xl">
                        {blog.title}
                      </h2>
                    </div>
                  </div>

                  <div className="min-w-0 p-5 sm:p-6">
                    <div className="flex min-w-0 items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 sm:text-xs sm:tracking-[0.2em]">
                      <CalendarDays size={15} className="shrink-0" />
                      <span className="truncate">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-3 break-words text-sm font-semibold leading-6 text-zinc-400">
                      {blog.excerpt || blog.content}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-black text-white">
                      Read Article <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}