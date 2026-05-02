"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Camera,
  Dumbbell,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
} from "lucide-react";

type PublicSettings = {
  gymName: string;
  logoUrl: string | null;
  currency: string;
  monthlyFee: number;
  personalTrainingFee: number;
};

const FACEBOOK_URL = "https://www.facebook.com/";
const TIKTOK_URL = "https://www.tiktok.com/";
const INSTAGRAM_URL = "https://www.instagram.com/";

export default function PublicFooterClient() {
  const [brand, setBrand] = useState<PublicSettings>({
    gymName: "Dolphin Fitness Center",
    logoUrl: null,
    currency: "LKR",
    monthlyFee: 3500,
    personalTrainingFee: 15000,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();

        if (res.ok) {
          setBrand({
            gymName: data.gymName || "Dolphin Fitness Center",
            logoUrl: data.logoUrl || null,
            currency: data.currency || "LKR",
            monthlyFee: data.monthlyFee || 3500,
            personalTrainingFee: data.personalTrainingFee || 15000,
          });
        }
      } catch {
        // Keep default footer if settings fail
      }
    }

    loadSettings();
  }, []);

  return (
    <footer className="relative z-20 border-t border-white/10 bg-black px-4 py-10 text-white sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-black">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.gymName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Dumbbell size={24} />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-lg font-black sm:text-xl">
                {brand.gymName}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 sm:text-xs sm:tracking-[0.3em]">
                Center
              </p>
            </div>
          </Link>

          <p className="mt-5 max-w-sm text-sm font-semibold leading-6 text-zinc-500">
            Advanced gym membership, monthly payment, coach, body profile, and
            reminder management system.
          </p>

          <Link
            href="/feedback"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02] hover:bg-zinc-200 sm:w-fit"
          >
            <MessageCircle size={17} />
            Submit Feedback
          </Link>
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-black">Quick Links</h3>

          <div className="mt-5 grid gap-3 text-sm font-bold text-zinc-400">
            <FooterLink href="/" label="Home" />
            <FooterLink href="/coaches" label="Coaches" />
            <FooterLink href="/pricing" label="Pricing" />
            <FooterLink href="/blogs" label="Blogs" />
            <FooterLink href="/our-story" label="Our Story" />
            <FooterLink href="/location" label="Location" />
            <FooterLink href="/contact" label="Contact Us" />
            <FooterLink href="/feedback" label="Submit Feedback" />
            <FooterLink href="/register" label="Register" />
            <FooterLink href="/login" label="Member Login" />
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-black">Gym Info</h3>

          <div className="mt-5 space-y-3 text-sm font-bold text-zinc-400">
            <InfoRow
              icon={<Phone size={17} />}
              text="Contact admin for membership support"
            />
            <InfoRow
              icon={<Mail size={17} />}
              text="Payment and profile support available"
            />
            <InfoRow icon={<MapPin size={17} />} text="Sri Lanka" />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Current Monthly Fee
            </p>
            <p className="mt-2 break-words text-2xl font-black">
              {brand.currency} {brand.monthlyFee.toLocaleString()}
            </p>
            <p className="mt-1 break-words text-xs font-semibold text-zinc-500">
              Personal training adds {brand.currency}{" "}
              {brand.personalTrainingFee.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-black">Follow Us</h3>

          <p className="mt-5 text-sm font-semibold leading-6 text-zinc-500">
            Follow our gym social pages for workout clips, updates,
            announcements, and fitness moments.
          </p>

          <div className="mt-5 grid gap-3">
            <SocialLink
              href={FACEBOOK_URL}
              icon={<ExternalLink size={18} />}
              label="Facebook Page"
            />

            <SocialLink
              href={TIKTOK_URL}
              icon={<Music2 size={18} />}
              label="TikTok Page"
            />

            <SocialLink
              href={INSTAGRAM_URL}
              icon={<Camera size={18} />}
              label="Instagram Page"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs font-bold leading-6 text-zinc-600">
        © {new Date().getFullYear()} {brand.gymName}. All rights reserved.
        Crafted by{" "}
        <span className="font-black text-zinc-300">Kavindu Anuhas</span>.
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="break-words transition hover:text-white">
      {label}
    </Link>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="break-words">{text}</span>
    </div>
  );
}

function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-zinc-300 transition hover:bg-white hover:text-black sm:hover:translate-x-1"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-black transition group-hover:bg-black group-hover:text-white">
          {icon}
        </span>
        <span className="min-w-0 truncate">{label}</span>
      </span>

      <span className="shrink-0 text-xs opacity-60">Open</span>
    </a>
  );
}