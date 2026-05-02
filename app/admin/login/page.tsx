"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dumbbell, Loader2, Lock, Mail } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginAdmin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Admin login failed.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setMessage("Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-black px-6 py-12 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="animate-glow-pulse absolute left-[-10%] top-[-20%] h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
        <div className="animate-float-slow absolute right-[-10%] bottom-[-20%] h-[520px] w-[520px] rounded-full bg-zinc-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-black">
            <Dumbbell size={30} />
          </div>

          <p className="mt-6 font-bold uppercase tracking-[0.3em] text-zinc-500">
            Admin Secure Login
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Welcome Back
          </h1>

          <p className="mt-3 text-sm font-semibold leading-6 text-zinc-500">
            Login with an admin account to access the Dolphin Fitness Center
            admin dashboard.
          </p>

          {message && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
              {message}
            </div>
          )}

          <form onSubmit={loginAdmin} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Admin Email
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                <Mail size={18} className="text-zinc-500" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-transparent font-semibold text-white outline-none placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Password
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                <Lock size={18} className="text-zinc-500" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-transparent font-semibold text-white outline-none placeholder:text-zinc-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="shine-effect flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-black text-black transition hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Logging in...
                </>
              ) : (
                "Login to Admin"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}