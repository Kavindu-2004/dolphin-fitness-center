"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Dumbbell, Sparkles, X } from "lucide-react";

type PublicSettings = {
  gymName: string;
  logoUrl: string | null;
};

export default function JoinUsPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [brand, setBrand] = useState<PublicSettings>({
    gymName: "Dolphin Fitness Center",
    logoUrl: null,
  });

  useEffect(() => {
    async function loadBrandSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();

        if (res.ok) {
          setBrand({
            gymName: data.gymName || "Dolphin Fitness Center",
            logoUrl: data.logoUrl || null,
          });
        }
      } catch {
        // Keep default logo/name if settings fail
      }
    }

    loadBrandSettings();
  }, []);

  useEffect(() => {
    /*
      If a member/admin session is stored in localStorage, popup will not show.
      If not signed in, popup shows every new page load after 1.8 seconds.
    */
    const possibleSession =
      localStorage.getItem("dolphin_member_id") ||
      localStorage.getItem("dolphin_member_name") ||
      localStorage.getItem("customer") ||
      localStorage.getItem("member") ||
      localStorage.getItem("user") ||
      localStorage.getItem("dolphin_member") ||
      localStorage.getItem("dolphin_user");

    if (possibleSession) {
      setShowPopup(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  function closePopup() {
    setShowPopup(false);
  }

  if (!showPopup) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={closePopup}
      />

      <div className="animate-slide-up relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-black text-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-glow-pulse absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="animate-float-slow absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-zinc-500/20 blur-3xl" />
        </div>

        <button
          type="button"
          onClick={closePopup}
          className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-zinc-400 transition hover:bg-white hover:text-black"
          aria-label="Close popup"
        >
          <X size={18} />
        </button>

        <div className="relative z-10 p-8">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white text-black shadow-2xl">
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.gymName}
                className="h-full w-full object-cover"
              />
            ) : (
              <Dumbbell size={34} />
            )}
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
            <Sparkles size={15} />
            Join Our Fitness Community
          </div>

          <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight">
            Ready to start your fitness journey?
          </h2>

          <p className="mt-4 text-sm font-semibold leading-7 text-zinc-400">
            Join {brand.gymName} today and get monthly membership, personal
            training, body profile tracking, and smart payment reminders.
          </p>

          <div className="mt-6 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-4">
            <Benefit text="Monthly membership plans" />
            <Benefit text="Personal coach selection" />
            <Benefit text="Body profile and progress tracking" />
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              href="/register"
              onClick={closePopup}
              className="shine-effect inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-4 text-sm font-black text-black transition hover:scale-[1.02]"
            >
              Register Now <ArrowRight size={17} />
            </Link>

            <Link
              href="/contact"
              onClick={closePopup}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/30 px-5 py-4 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-white/10"
            >
              Contact Gym
            </Link>
          </div>

          <button
            type="button"
            onClick={closePopup}
            className="mt-4 w-full text-center text-sm font-bold text-zinc-500 transition hover:text-white"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-zinc-300">
      <span className="h-2 w-2 rounded-full bg-white" />
      {text}
    </div>
  );
}