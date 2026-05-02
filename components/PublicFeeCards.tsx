"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Crown, Loader2 } from "lucide-react";

type MembershipPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthlyFee: number;
  features: string | null;
  isActive: boolean;
  isPersonalTraining: boolean;
  requiresCoach: boolean;
  priority: number;
};

type PublicSettings = {
  currency: string;
};

export default function PublicFeeCards() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [settings, setSettings] = useState<PublicSettings>({
    currency: "LKR",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlansAndSettings() {
      try {
        const [plansRes, settingsRes] = await Promise.all([
          fetch("/api/public/membership-plans"),
          fetch("/api/settings"),
        ]);

        const plansData = await plansRes.json();
        const settingsData = await settingsRes.json();

        if (Array.isArray(plansData)) {
          setPlans(plansData);
        }

        if (settingsRes.ok) {
          setSettings({
            currency: settingsData.currency || "LKR",
          });
        }
      } catch (error) {
        console.error("PUBLIC_MEMBERSHIP_PLANS_LOAD_ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPlansAndSettings();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-zinc-400">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Loader2 className="animate-spin" size={16} />
          Loading membership plans...
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-zinc-400">
        <p className="text-sm font-bold">
          No active membership plans available.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-4">
      {plans.map((plan, index) => {
        const features = (plan.features || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

        const highlighted =
          plan.isPersonalTraining ||
          plan.slug.includes("diamond") ||
          index === plans.length - 1;

        return (
          <div
            key={plan.id}
            className={`rounded-2xl p-5 transition duration-300 hover:scale-[1.02] ${
              highlighted
                ? "bg-white text-black"
                : "bg-zinc-900 text-white ring-1 ring-white/10"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className={`text-sm font-semibold ${
                    highlighted ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  {plan.name}
                </p>

                <h3 className="mt-2 text-3xl font-black">
                  {settings.currency} {plan.monthlyFee.toLocaleString()}
                </h3>

                <p
                  className={`mt-2 text-sm leading-6 ${
                    highlighted ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  {plan.description ||
                    "Monthly membership plan with gym access and member support."}
                </p>
              </div>

              {highlighted && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                  <Crown size={18} />
                </div>
              )}
            </div>

            {features.length > 0 && (
              <div className="mt-4 grid gap-2">
                {features.slice(0, 4).map((feature) => (
                  <div
                    key={feature}
                    className={`flex items-center gap-2 text-sm font-bold ${
                      highlighted ? "text-zinc-700" : "text-zinc-300"
                    }`}
                  >
                    <CheckCircle2 size={15} />
                    {feature}
                  </div>
                ))}
              </div>
            )}

            {plan.requiresCoach && (
              <div
                className={`mt-4 rounded-full px-3 py-2 text-center text-xs font-black ${
                  highlighted
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                Coach selection required
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}