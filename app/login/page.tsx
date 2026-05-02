"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);

  useEffect(() => {
    const memberId = localStorage.getItem("dolphin_member_id");

    if (memberId) {
      router.push("/my-profile");
      return;
    }

    setCheckingLogin(false);
  }, [router]);

  function updateField(name: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("dolphin_member_id", data.memberId);
      localStorage.setItem("dolphin_member_name", data.name);

      router.push("/my-profile");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 py-10 text-white sm:px-6">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-center text-sm font-bold text-zinc-400 sm:p-8">
          Checking login...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none fixed inset-0">
        <div className="animate-glow-pulse absolute left-[-20%] top-[-20%] h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl sm:h-[500px] sm:w-[500px]" />
        <div className="animate-float-slow absolute bottom-[-20%] right-[-20%] h-[360px] w-[360px] rounded-full bg-zinc-500/20 blur-3xl sm:h-[500px] sm:w-[500px]" />
      </div>

      <form
        onSubmit={handleLogin}
        className="animate-slide-up relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur transition duration-300 hover:bg-white/[0.08] sm:p-8"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-black sm:h-16 sm:w-16">
          <LockKeyhole size={30} />
        </div>

        <h1 className="mt-8 break-words text-3xl font-black sm:text-4xl">
          Member Login
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
          Login to view your membership, payments, body profile, and coach.
        </p>

        <div className="mt-8 space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(value) => updateField("email", value)}
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) => updateField("password", value)}
          />

          {message && (
            <div className="break-words rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-bold text-zinc-300">
              {message}
            </div>
          )}

          <button
            disabled={loading}
            className="shine-effect flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-black transition duration-300 hover:scale-[1.02] hover:bg-zinc-200 disabled:opacity-60 sm:text-base"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </div>
      </form>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-bold text-zinc-400">
        {label}
      </label>

      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-semibold text-white outline-none transition focus:border-white"
      />
    </div>
  );
}