"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dumbbell, LogOut, Menu, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";

type PublicSettings = {
  gymName: string;
  logoUrl: string | null;
};

const guestNavLinks = [
  { href: "/", label: "Home" },
  { href: "/coaches", label: "Coaches" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blogs", label: "Blogs" },
  { href: "/our-story", label: "Our Story" },
  { href: "/location", label: "Location" },
  { href: "/contact", label: "Contact" },
  { href: "/register", label: "Register" },
];

const memberNavLinks = [
  { href: "/", label: "Home" },
  { href: "/coaches", label: "Coaches" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blogs", label: "Blogs" },
  { href: "/our-story", label: "Our Story" },
  { href: "/location", label: "Location" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNavbarClient() {
  const router = useRouter();

  const [brand, setBrand] = useState<PublicSettings>({
    gymName: "Dolphin Fitness Center",
    logoUrl: null,
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string | null>(null);

  const isLoggedIn = Boolean(memberId);
  const navLinks = isLoggedIn ? memberNavLinks : guestNavLinks;

  useEffect(() => {
    async function loadSettings() {
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
        // Keep default brand if settings fail
      }
    }

    loadSettings();
  }, []);

  useEffect(() => {
    function syncMemberLogin() {
      setMemberId(localStorage.getItem("dolphin_member_id"));
      setMemberName(localStorage.getItem("dolphin_member_name"));
    }

    syncMemberLogin();

    window.addEventListener("storage", syncMemberLogin);
    window.addEventListener("focus", syncMemberLogin);

    return () => {
      window.removeEventListener("storage", syncMemberLogin);
      window.removeEventListener("focus", syncMemberLogin);
    };
  }, []);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function logout() {
    localStorage.removeItem("dolphin_member_id");
    localStorage.removeItem("dolphin_member_name");

    setMemberId(null);
    setMemberName(null);
    setMobileOpen(false);

    router.push("/login");
  }

  return (
    <nav className="relative z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-[76px] items-center justify-between gap-3 py-4">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="group flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-black transition duration-300 group-hover:rotate-6 group-hover:scale-110">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.gymName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Dumbbell size={22} />
              )}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-black leading-none tracking-tight text-white sm:text-xl">
                {brand.gymName}
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500 sm:text-xs sm:tracking-[0.3em]">
                Center
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-semibold text-zinc-300 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {isLoggedIn ? (
              <>
                <Link
                  href="/my-profile"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-black transition hover:scale-[1.02] hover:bg-zinc-200"
                >
                  <UserRound size={16} />
                  {memberName || "My Profile"}
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-white transition hover:bg-white/10"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-white transition hover:bg-white/10"
                >
                  Member Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-full bg-white px-4 py-2 text-sm font-black text-black transition hover:scale-[1.02] hover:bg-zinc-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/10 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 pb-5 pt-4 lg:hidden">
            <div className="grid gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black"
                >
                  {link.label}
                </Link>
              ))}

              {isLoggedIn ? (
                <>
                  <Link
                    href="/my-profile"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
                  >
                    <UserRound size={17} />
                    {memberName || "My Profile"}
                  </Link>

                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-white/10"
                  >
                    Member Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-black transition hover:bg-zinc-200"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}