"use client";

import PublicFooterClient from "@/components/PublicFooterClient";
import PublicNavbarClient from "@/components/PublicNavbarClient";
import { Loader2, MessageCircle, Send, Star, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type MemberProfile = {
  id: string;
  memberNo: string;
  profileImage: string | null;
  user: {
    name: string;
    email: string;
    phone: string;
  };
};

export default function FeedbackPage() {
  const router = useRouter();

  const [memberId, setMemberId] = useState("");
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadMember() {
      const savedMemberId = localStorage.getItem("dolphin_member_id");

      if (!savedMemberId) {
        setLoading(false);
        return;
      }

      setMemberId(savedMemberId);

      try {
        const res = await fetch(`/api/member/profile?memberId=${savedMemberId}`);
        const data = await res.json();

        if (res.ok) {
          setProfile(data);
        }
      } catch {
        setStatusMessage("Could not load your member profile.");
      } finally {
        setLoading(false);
      }
    }

    loadMember();
  }, []);

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault();

    if (!memberId) {
      setStatusMessage("Please login before submitting feedback.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("");

    try {
      const res = await fetch("/api/member/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          rating,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage(data.message || "Failed to submit feedback.");
        return;
      }

      setMessage("");
      setRating(5);
      setStatusMessage(
        "Feedback submitted successfully. It will appear on the website after admin approval."
      );
    } catch {
      setStatusMessage("Something went wrong while submitting feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <PublicNavbarClient />

      <section className="relative px-6 py-16">
        <div className="pointer-events-none fixed inset-0">
          <div className="animate-glow-pulse absolute left-[-10%] top-[-20%] h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
          <div className="animate-float-slow absolute right-[-10%] bottom-[-20%] h-[520px] w-[520px] rounded-full bg-zinc-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="animate-slide-up">
            <p className="font-bold uppercase tracking-[0.3em] text-zinc-500">
              Member Feedback
            </p>

            <h1 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">
              Share Your Gym Experience
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
              Submit your feedback about Dolphin Fitness Center. Your feedback
              will be reviewed by admin before it appears on the website.
            </p>
          </div>

          {loading ? (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-zinc-400">
              Loading feedback page...
            </div>
          ) : !memberId ? (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-black">
                <UserRound size={30} />
              </div>

              <h2 className="mt-6 text-3xl font-black">Login Required</h2>

              <p className="mt-3 text-zinc-400">
                Only registered members can submit feedback. Please login first
                using your membership account.
              </p>

              <button
                onClick={() => router.push("/login")}
                className="shine-effect mt-6 rounded-full bg-white px-6 py-4 font-black text-black transition hover:scale-[1.02]"
              >
                Login to Submit Feedback
              </button>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
                <div className="h-24 w-24 overflow-hidden rounded-[2rem] bg-white text-black">
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserRound size={42} />
                    </div>
                  )}
                </div>

                <h2 className="mt-6 text-3xl font-black">
                  {profile?.user.name || "Member"}
                </h2>

                <p className="mt-2 text-sm font-bold text-zinc-500">
                  {profile?.memberNo || "Member Account"}
                </p>

                <p className="mt-5 text-sm leading-6 text-zinc-400">
                  Your profile image and name will be used on the public
                  testimonial card after admin approval.
                </p>
              </div>

              <form
                onSubmit={submitFeedback}
                className="rounded-[2rem] border border-white/10 bg-white p-8 text-black shadow-2xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-black text-white">
                  <MessageCircle size={30} />
                </div>

                <h2 className="mt-8 text-4xl font-black">Write Feedback</h2>

                <p className="mt-3 text-sm font-semibold leading-6 text-zinc-600">
                  Tell us about your training experience, coaching, gym
                  environment, or membership service.
                </p>

                <div className="mt-8">
                  <label className="mb-3 block text-sm font-black text-zinc-600">
                    Rating
                  </label>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition hover:scale-105 ${
                          value <= rating
                            ? "border-black bg-black text-white"
                            : "border-zinc-200 bg-zinc-100 text-zinc-400"
                        }`}
                      >
                        <Star size={20} fill={value <= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="mb-2 block text-sm font-black text-zinc-600">
                    Your Feedback
                  </label>

                  <textarea
                    required
                    rows={7}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your feedback here..."
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-4 font-semibold text-black outline-none transition placeholder:text-zinc-400 focus:border-black"
                  />
                </div>

                {statusMessage && (
                  <div className="mt-5 rounded-2xl bg-zinc-100 px-4 py-4 text-sm font-bold text-zinc-700">
                    {statusMessage}
                  </div>
                )}

                <button
                  disabled={submitting}
                  className="shine-effect mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-4 font-black text-white transition hover:scale-[1.02] disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Submitting Feedback...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Feedback
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <PublicFooterClient />
    </main>
  );
}