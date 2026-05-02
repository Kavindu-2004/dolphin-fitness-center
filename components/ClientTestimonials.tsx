"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Star, UserRound } from "lucide-react";
import Link from "next/link";

type PublicFeedback = {
  id: string;
  rating: number;
  message: string;
  createdAt: string;
  approvedAt: string | null;
  member: {
    memberNo: string;
    profileImage: string | null;
    name: string;
  };
};

export default function ClientTestimonials() {
  const [feedbacks, setFeedbacks] = useState<PublicFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    async function loadFeedbacks() {
      try {
        const res = await fetch("/api/public/feedbacks");
        const data = await res.json();

        if (Array.isArray(data)) {
          setFeedbacks(data);
        }
      } catch (error) {
        console.error("LOAD_PUBLIC_FEEDBACKS_ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFeedbacks();
  }, []);

  useEffect(() => {
    if (feedbacks.length <= 3) return;

    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % feedbacks.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [feedbacks.length]);

  const visibleFeedbacks = useMemo(() => {
    if (feedbacks.length <= 3) {
      return feedbacks;
    }

    return [0, 1, 2].map((offset) => {
      return feedbacks[(startIndex + offset) % feedbacks.length];
    });
  }, [feedbacks, startIndex]);

  return (
    <section className="relative z-10 border-y border-white/10 bg-white/[0.03]">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-bold uppercase tracking-[0.3em] text-zinc-500">
              Testimonials
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              What Our Clients Say
            </h2>
          </div>

          <div className="max-w-xl">
            <p className="text-zinc-400">
              Real feedback submitted by registered members and approved by the
              gym admin.
            </p>

            <Link
              href="/feedback"
              className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02]"
            >
              Submit Feedback
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-zinc-400">
            Loading client feedback...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-black">
              <MessageCircle size={30} />
            </div>

            <h3 className="mt-6 text-3xl font-black">
              No approved feedback yet
            </h3>

            <p className="mt-3 max-w-2xl text-zinc-400">
              When members submit feedback and admin approves it, testimonials
              will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              {visibleFeedbacks.map((feedback, index) => (
                <FeedbackCard
                  key={`${feedback.id}-${startIndex}-${index}`}
                  feedback={feedback}
                  index={index}
                />
              ))}
            </div>

            {feedbacks.length > 3 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {feedbacks.map((feedback, index) => (
                  <button
                    key={feedback.id}
                    type="button"
                    onClick={() => setStartIndex(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === startIndex
                        ? "w-8 bg-white"
                        : "w-2.5 bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Show feedback ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function FeedbackCard({
  feedback,
  index,
}: {
  feedback: PublicFeedback;
  index: number;
}) {
  return (
    <div
      className="shine-effect group animate-slide-up rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:bg-white/[0.09]"
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="h-18 w-18 overflow-hidden rounded-3xl bg-white text-black">
          {feedback.member.profileImage ? (
            <img
              src={feedback.member.profileImage}
              alt={feedback.member.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UserRound size={34} />
            </div>
          )}
        </div>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={17}
              fill={star <= feedback.rating ? "currentColor" : "none"}
              className={
                star <= feedback.rating ? "text-white" : "text-zinc-600"
              }
            />
          ))}
        </div>
      </div>

      <p className="mt-6 line-clamp-5 min-h-[140px] text-sm font-semibold leading-7 text-zinc-300">
        “{feedback.message}”
      </p>

      <div className="mt-6 border-t border-white/10 pt-5">
        <h3 className="text-xl font-black">{feedback.member.name}</h3>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
          {feedback.member.memberNo}
        </p>
      </div>
    </div>
  );
}