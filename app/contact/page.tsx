import PublicFooter from "@/components/PublicFooter";
import PublicNavbar from "@/components/PublicNavbar";
import { prisma } from "@/lib/prisma";
import {
  Clock,
  Dumbbell,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getContactSettings() {
  const settings = await prisma.systemSetting.findFirst();

  return {
    gymName: settings?.gymName || "Dolphin Fitness Center",
    logoUrl: settings?.logoUrl || null,
  };
}

export default async function ContactPage() {
  const brand = await getContactSettings();

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <PublicNavbar />

      <section className="relative px-6 py-16">
        <div className="pointer-events-none fixed inset-0">
          <div className="animate-glow-pulse absolute left-[-10%] top-[-20%] h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
          <div className="animate-float-slow absolute right-[-10%] bottom-[-20%] h-[520px] w-[520px] rounded-full bg-zinc-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="animate-slide-up">
            <p className="font-bold uppercase tracking-[0.3em] text-zinc-500">
              Contact Us
            </p>

            <h1 className="mt-3 max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
              Talk to {brand.gymName}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
              Have questions about membership, personal training, payments, or
              body profile tracking? Contact the gym team and get support before
              joining.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <ContactCard
                icon={<Phone size={24} />}
                title="Phone Support"
                text="Call the gym team for membership, renewal, and payment help."
                value="+94 77 000 0000"
              />

              <ContactCard
                icon={<Mail size={24} />}
                title="Email Support"
                text="Send your questions about registration, coaching, or payment issues."
                value="dolphinfitnesscenter@gmail.com"
              />

              <ContactCard
                icon={<MapPin size={24} />}
                title="Visit Gym"
                text="Visit us directly and speak with the admin team."
                value="Sri Lanka"
              />

              <ContactCard
                icon={<Clock size={24} />}
                title="Opening Hours"
                text="Training and support hours can be updated later from admin settings."
                value="Monday - Sunday"
              />
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white p-8 text-black shadow-2xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-black text-white">
                <MessageCircle size={30} />
              </div>

              <h2 className="mt-8 text-4xl font-black">Send a Message</h2>

              <p className="mt-3 text-zinc-600">
                This contact form is ready as a UI. Later we can connect it to
                email or save messages to the database.
              </p>

              <form className="mt-8 space-y-4">
                <Input label="Full Name" placeholder="Enter your name" />
                <Input label="Email Address" placeholder="Enter your email" />
                <Input label="Phone Number" placeholder="Enter your phone" />

                <div>
                  <label className="mb-2 block text-sm font-black text-zinc-600">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Write your message..."
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-4 font-semibold text-black outline-none transition placeholder:text-zinc-400 focus:border-black"
                  />
                </div>

                <button
                  type="button"
                  className="shine-effect flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-4 font-black text-white transition hover:scale-[1.02]"
                >
                  <Send size={18} />
                  Send Message
                </button>
              </form>
            </div>
          </div>

          <section className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
              <div>
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-white text-black">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.gymName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Dumbbell size={30} />
                  )}
                </div>

                <h2 className="mt-6 text-3xl font-black">
                  Need membership help?
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  You can register online, select a coach, upload a profile
                  picture, and view your payments from the member profile.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <MiniBox title="Registration" text="Create membership online" />
                <MiniBox title="Payments" text="Track monthly payment history" />
                <MiniBox title="Coaching" text="Select personal trainer" />
              </div>
            </div>
          </section>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function ContactCard({
  icon,
  title,
  text,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  value: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.09]">
      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-black">
        {icon}
      </div>

      <h2 className="mt-5 text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
      <p className="mt-4 font-black text-zinc-200">{value}</p>
    </div>
  );
}

function Input({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-zinc-600">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-4 font-semibold text-black outline-none transition placeholder:text-zinc-400 focus:border-black"
      />
    </div>
  );
}

function MiniBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
        {text}
      </p>
    </div>
  );
}