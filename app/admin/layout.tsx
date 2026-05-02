import AdminSidebar from "@/components/AdminSidebar";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import AdminMobileMenuCloseListener from "@/components/AdminMobileMenuCloseListener";
import { Menu, ShieldCheck } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <AdminMobileMenuCloseListener />

      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 px-4 py-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
              <ShieldCheck size={22} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-black leading-none">
                Admin OS
              </h1>
              <p className="mt-1 truncate text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
                Mobile Panel
              </p>
            </div>
          </div>

          <label
            htmlFor="admin-mobile-menu"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/10"
          >
            <Menu size={22} />
          </label>
        </div>
      </header>

      <input id="admin-mobile-menu" type="checkbox" className="peer hidden" />

      <div className="fixed inset-0 z-50 hidden bg-black/70 backdrop-blur-sm peer-checked:block lg:hidden">
        <label
          htmlFor="admin-mobile-menu"
          className="absolute inset-0 cursor-pointer"
        />

        <div className="relative h-full w-[86%] max-w-80 overflow-y-auto border-r border-white/10 bg-black shadow-2xl">
          <AdminSidebar />
        </div>
      </div>

      <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_35%)] p-4 sm:p-6 lg:ml-80 lg:p-8">
        <div className="mb-6 flex justify-end">
          <AdminLogoutButton />
        </div>

        {children}
      </main>
    </div>
  );
}