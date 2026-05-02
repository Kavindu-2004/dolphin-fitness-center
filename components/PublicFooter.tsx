import Link from "next/link";
import { prisma } from "@/lib/prisma";
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

export const dynamic = "force-dynamic";

const FACEBOOK_URL = "https://www.facebook.com/";
const TIKTOK_URL = "https://www.tiktok.com/";
const INSTAGRAM_URL = "https://www.instagram.com/";

async function getFooterSettings() {
  const settings = await prisma.systemSetting.findFirst();

  return {
    gymName: settings?.gymName || "Dolphin Fitness Center",
    logoUrl: settings?.logoUrl || null,
    currency: settings?.currency || "LKR",
    monthlyFee: settings?.monthlyFee || 3500,
    personalTrainingFee: settings?.personalTrainingFee || 15000,
  };
}

export default async function PublicFooter() {
  const brand = await getFooterSettings();

  return (
    <footer className="relative z-20 border-t border-white/10 bg-black px-6 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white text-black">
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

            <div>
              <h2 className="text-xl font-black">{brand.gymName}</h2>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
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
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02] hover:bg-zinc-200"
          >
            <MessageCircle size={17} />
            Submit Feedback
          </Link>
        </div>

        <div>
          <h3 className="text-lg font-black">Quick Links</h3>

          <div className="mt-5 space-y-3 text-sm font-bold text-zinc-400">
            <Link href="/" className="block transition hover:text-white">
              Home
            </Link>

            <Link href="/coaches" className="block transition hover:text-white">
              Coaches
            </Link>

            <Link href="/blogs" className="block transition hover:text-white">
              Blogs
            </Link>

            <Link
              href="/our-story"
              className="block transition hover:text-white"
            >
              Our Story
            </Link>

            <Link
              href="/location"
              className="block transition hover:text-white"
            >
              Location
            </Link>

            <Link href="/contact" className="block transition hover:text-white">
              Contact Us
            </Link>

            <Link href="/feedback" className="block transition hover:text-white">
              Submit Feedback
            </Link>

            <Link
              href="/register"
              className="block transition hover:text-white"
            >
              Register
            </Link>

            <Link href="/login" className="block transition hover:text-white">
              Member Login
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black">Gym Info</h3>

          <div className="mt-5 space-y-3 text-sm font-bold text-zinc-400">
            <div className="flex items-center gap-3">
              <Phone size={17} />
              <span>Contact admin for membership support</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail size={17} />
              <span>Payment and profile support available</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={17} />
              <span>Sri Lanka</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Current Monthly Fee
            </p>
            <p className="mt-2 text-2xl font-black">
              {brand.currency} {brand.monthlyFee.toLocaleString()}
            </p>
            <p className="mt-1 text-xs font-semibold text-zinc-500">
              Personal training adds {brand.currency}{" "}
              {brand.personalTrainingFee.toLocaleString()}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black">Follow Us</h3>

          <p className="mt-5 text-sm font-semibold leading-6 text-zinc-500">
            Follow our gym social pages for workout clips, member updates,
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

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs font-bold text-zinc-600">
        © {new Date().getFullYear()} {brand.gymName}. All rights reserved.
        Crafted by{" "}
        <span className="font-black text-zinc-300">Kavindu Anuhas</span>.
      </div>
    </footer>
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
      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-zinc-300 transition hover:translate-x-1 hover:bg-white hover:text-black"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black transition group-hover:bg-black group-hover:text-white">
          {icon}
        </span>
        {label}
      </span>

      <span className="text-xs opacity-60">Open</span>
    </a>
  );
}