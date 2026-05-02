"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const onlinePaymentId = searchParams.get("onlinePaymentId");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [message, setMessage] = useState("");

  async function simulateSuccess() {
    if (!onlinePaymentId) {
      setStatus("ERROR");
      setMessage("Online payment ID is missing.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/member/online-payment/success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          onlinePaymentId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("ERROR");
        setMessage(data.message || "Payment failed.");
        return;
      }

      setStatus("SUCCESS");
      setMessage("Payment completed. Membership renewed successfully.");
    } catch {
      setStatus("ERROR");
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-black">
          {status === "SUCCESS" ? (
            <CheckCircle2 size={42} />
          ) : status === "ERROR" ? (
            <XCircle size={42} />
          ) : (
            <CheckCircle2 size={42} />
          )}
        </div>

        <h1 className="mt-8 text-4xl font-black">Online Payment</h1>

        <p className="mt-3 text-zinc-400">
          This is the HelaPay-ready demo payment success page. Later we will
          replace this button with the real HelaPay callback.
        </p>

        {onlinePaymentId && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-bold text-zinc-300">
            Payment ID: {onlinePaymentId}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-bold text-zinc-300">
            {message}
          </div>
        )}

        {status !== "SUCCESS" && (
          <button
            onClick={simulateSuccess}
            disabled={loading}
            className="shine-effect mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-black text-black transition hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processing Payment...
              </>
            ) : (
              "Simulate HelaPay Success"
            )}
          </button>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/my-profile"
            className="rounded-full bg-white px-6 py-4 font-black text-black transition hover:scale-[1.02]"
          >
            Back to My Profile
          </Link>

          <Link
            href="/"
            className="rounded-full border border-white/10 bg-black/30 px-6 py-4 font-black text-white transition hover:scale-[1.02]"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}