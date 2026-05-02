"use client";

import Link from "next/link";
import {
  BarChart3,
  BellRing,
  BookOpen,
  Crown,
  Dumbbell,
  Film,
  Home,
  Megaphone,
  MessageCircle,
  Settings,
  UserRoundCog,
  Users,
  WalletCards,
} from "lucide-react";

type Brand = {
  gymName: string;
  logoUrl: string | null;
  currency: string;
  monthlyFee: number;
  personalTrainingFee: number;
};

type MenuItem = {
  name: string;
  href: string;
  iconName: string;
};

const icons = {
  Home,
  Users,
  WalletCards,
  Crown,
  Dumbbell,
  UserRoundCog,
  BellRing,
  Megaphone,
  Film,
  BookOpen,
  MessageCircle,
  BarChart3,
  Settings,
};

export default function AdminSidebarClient({
  brand,
  menuItems,
}: {
  brand: Brand;
  menuItems: MenuItem[];
}) {
  function closeMobileSidebar() {
    window.dispatchEvent(new Event("close-admin-mobile-sidebar"));
  }

  return (
    <aside className="relative h-full min-h-screen w-full overflow-y-auto border-r border-white/10 bg-black p-4 text-white sm:p-6 lg:fixed lg:left-0 lg:top-0 lg:z-30 lg:h-screen lg:w-80">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-glow-pulse absolute -left-20 top-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        <div className="animate-float-slow absolute bottom-10 right-0 h-56 w-56 rounded-full bg-zinc-600/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Link
          href="/"
          onClick={closeMobileSidebar}
          className="group flex items-center gap-3"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-black transition duration-300 group-hover:rotate-6 group-hover:scale-110">
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
            <h1 className="line-clamp-2 text-lg font-black leading-none sm:text-xl">
              {brand.gymName}
            </h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
              Admin OS
            </p>
          </div>
        </Link>

        <div className="mt-7 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur transition duration-300 hover:scale-[1.02] hover:bg-white/10 sm:mt-9 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            System Status
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="font-black">Payment System</p>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-black">
              Online
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[82%] rounded-full bg-white" />
          </div>
        </div>

        <nav className="mt-6 space-y-2 sm:mt-8">
          {menuItems.map((item) => {
            const Icon = icons[item.iconName as keyof typeof icons] || Home;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileSidebar}
                className="group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-zinc-400 transition duration-300 hover:translate-x-1 hover:bg-white hover:text-black sm:hover:translate-x-2"
              >
                <Icon
                  size={19}
                  className="shrink-0 transition duration-300 group-hover:rotate-6 group-hover:scale-110"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shine-effect mt-7 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 transition duration-300 hover:-translate-y-1 hover:bg-white/10 sm:mt-8 sm:p-5">
          <p className="text-sm font-black">Monthly Fee</p>
          <p className="mt-2 text-2xl font-black sm:text-3xl">
            {brand.currency} {brand.monthlyFee.toLocaleString()}
          </p>
          <p className="mt-2 text-xs font-semibold leading-5 text-zinc-500">
            Personal training adds {brand.currency}{" "}
            {brand.personalTrainingFee.toLocaleString()} monthly.
          </p>
        </div>
      </div>
    </aside>
  );
}