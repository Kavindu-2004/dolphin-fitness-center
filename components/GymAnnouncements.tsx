"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  ImageIcon,
  Megaphone,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";

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

export default function GymAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await fetch("/api/public/announcements");
        const data = await res.json();

        if (Array.isArray(data)) {
          setAnnouncements(data);
        }
      } catch (error) {
        console.error("LOAD_PUBLIC_ANNOUNCEMENTS_ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [announcements.length]);

  if (loading) {
    return (
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-zinc-400">
          Loading gym announcements...
        </div>
      </section>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  const activeAnnouncement = announcements[activeIndex];

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-bold uppercase tracking-[0.3em] text-zinc-500">
            Live Updates
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            Gym Announcements
          </h2>
        </div>

        <p className="max-w-xl text-zinc-400">
          Real-time notices for closing days, gym events, important updates, and
          member information.
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem]">
        <div
          key={activeAnnouncement.id}
          className={`shine-effect animate-slide-left overflow-hidden rounded-[2rem] border shadow-2xl backdrop-blur-xl transition duration-700 ${getMainCardClass(
            activeAnnouncement.type
          )}`}
        >
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative h-[260px] overflow-hidden bg-black md:h-[320px]">
              {activeAnnouncement.imageUrl ? (
                <img
                  src={activeAnnouncement.imageUrl}
                  alt={activeAnnouncement.title}
                  className="h-[260px] w-full object-cover transition duration-700 hover:scale-105 md:h-[320px]"
                />
              ) : (
                <div className="flex h-[260px] w-full items-center justify-center bg-white text-black md:h-[320px]">
                  {getTypeIcon(activeAnnouncement.type, 72)}
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

              <div className="absolute bottom-6 left-6">
                <TypeBadge type={activeAnnouncement.type} />
              </div>
            </div>

            <div className="flex flex-col justify-between p-8 lg:min-h-[320px] lg:p-10">
              <div>
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.3em] opacity-50">
                      Latest Notice
                    </p>

                    <h3 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
                      {activeAnnouncement.title}
                    </h3>
                  </div>

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-black">
                    {activeAnnouncement.imageUrl ? (
                      <ImageIcon size={28} />
                    ) : (
                      getTypeIcon(activeAnnouncement.type)
                    )}
                  </div>
                </div>

                <p className="mt-6 max-w-3xl text-base font-semibold leading-8 opacity-80">
                  {activeAnnouncement.message}
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <InfoBox
                  label="Type"
                  value={formatType(activeAnnouncement.type)}
                  dark={activeAnnouncement.type === "NOTICE"}
                />

                <InfoBox
                  label="Priority"
                  value={`Level ${activeAnnouncement.priority}`}
                  dark={activeAnnouncement.type === "NOTICE"}
                />

                <InfoBox
                  label="Date"
                  value={
                    activeAnnouncement.eventDate
                      ? new Date(
                          activeAnnouncement.eventDate
                        ).toLocaleDateString()
                      : new Date(
                          activeAnnouncement.createdAt
                        ).toLocaleDateString()
                  }
                  dark={activeAnnouncement.type === "NOTICE"}
                />
              </div>

              <div className="mt-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                {announcements.length > 1 && (
                  <div className="flex items-center gap-2">
                    {announcements.map((announcement, index) => (
                      <button
                        key={announcement.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          index === activeIndex
                            ? "w-8 bg-current"
                            : "w-2.5 bg-current/30 hover:bg-current/60"
                        }`}
                        aria-label={`Show announcement ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-current/20 bg-black/30 px-5 py-3 text-sm font-black transition hover:scale-[1.02] hover:bg-black/50"
                >
                  Contact Gym for More Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getTypeIcon(type: AnnouncementType, size = 28) {
  if (type === "EVENT") return <CalendarClock size={size} />;
  if (type === "CLOSING_DAY") return <X size={size} />;
  if (type === "IMPORTANT") return <AlertTriangle size={size} />;
  return <Megaphone size={size} />;
}

function formatType(type: AnnouncementType) {
  if (type === "CLOSING_DAY") return "Closing Day";
  if (type === "IMPORTANT") return "Important";
  if (type === "EVENT") return "Event";
  return "Notice";
}

function getMainCardClass(type: AnnouncementType) {
  if (type === "CLOSING_DAY") {
    return "border-red-500/40 bg-red-500 text-white";
  }

  if (type === "IMPORTANT") {
    return "border-white bg-white text-black";
  }

  if (type === "EVENT") {
    return "border-white/10 bg-white/[0.09] text-white";
  }

  return "border-white/10 bg-white/[0.06] text-white";
}

function TypeBadge({
  type,
  small = false,
}: {
  type: AnnouncementType;
  small?: boolean;
}) {
  const className =
    type === "CLOSING_DAY"
      ? "bg-red-500 text-white"
      : type === "IMPORTANT"
      ? "bg-white text-black"
      : "border border-white/10 bg-black text-white";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-black ${className} ${
        small ? "text-[10px]" : "text-xs"
      }`}
    >
      {type === "EVENT" && <CalendarClock size={14} />}
      {type === "CLOSING_DAY" && <X size={14} />}
      {type === "IMPORTANT" && <AlertTriangle size={14} />}
      {type === "NOTICE" && <Sparkles size={14} />}
      {formatType(type).toUpperCase()}
    </span>
  );
}

function InfoBox({
  label,
  value,
  dark,
}: {
  label: string;
  value: string;
  dark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-4 ${
        dark ? "bg-black/30" : "bg-black text-white"
      }`}
    >
      <p className="text-xs font-black uppercase tracking-[0.2em] opacity-50">
        {label}
      </p>
      <p className="mt-2 font-black">{value}</p>
    </div>
  );
}