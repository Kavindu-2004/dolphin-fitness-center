"use client";

import { useEffect, useState } from "react";
import { Film, PlayCircle } from "lucide-react";

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

export default function DynamicGymVideos() {
  const [videos, setVideos] = useState<SiteVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideos() {
      try {
        const res = await fetch("/api/public/site-videos");
        const data = await res.json();

        if (Array.isArray(data)) {
          setVideos(data.slice(0, 2));
        }
      } catch (error) {
        console.error("LOAD_PUBLIC_SITE_VIDEOS_ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  if (loading) {
    return (
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-zinc-400">
          Loading gym videos...
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-bold uppercase tracking-[0.3em] text-zinc-500">
            Gym Videos
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            Inside Dolphin Fitness Center
          </h2>
        </div>

        <p className="max-w-xl text-zinc-400">
          Watch the latest gym atmosphere, training areas, and workout moments
          uploaded from the admin dashboard.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="shine-effect group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/[0.09]"
            style={{ animationDelay: `${index * 0.12}s` }}
          >
            <div className="relative aspect-video overflow-hidden bg-black">
              <video
                src={video.videoUrl}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                <PlayCircle size={14} />
                Auto Play
              </div>

              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="line-clamp-1 text-2xl font-black text-white">
                  {video.title}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <Film size={21} />
                </div>

                <div>
                  <h3 className="text-2xl font-black">{video.title}</h3>

                  <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-zinc-500">
                    {video.description ||
                      "Explore our gym environment, equipment, and training energy."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {videos.length === 1 && (
          <div className="flex min-h-[360px] items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-zinc-500">
            <div>
              <Film size={42} className="mx-auto opacity-50" />
              <p className="mt-4 text-lg font-black text-zinc-400">
                Add one more active video
              </p>
              <p className="mt-2 text-sm font-semibold leading-6">
                Upload another active video from admin to complete this section.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}