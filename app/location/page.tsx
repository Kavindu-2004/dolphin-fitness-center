import PublicFooter from "@/components/PublicFooter";
import PublicNavbar from "@/components/PublicNavbar";
import { prisma } from "@/lib/prisma";
import {
  Clock,
  Dumbbell,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Route,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getLocationSettings() {
  const settings = await prisma.systemSetting.findFirst();

  return {
    gymName: settings?.gymName || "Dolphin Fitness Center",
    logoUrl: settings?.logoUrl || null,
  };
}

export default async function LocationPage() {
  const brand = await getLocationSettings();

  const googleMapsLink =
    "https://www.google.com/maps/search/maho+bus+stand/@7.8216613,80.2733059,20.43z?entry=ttu&g_ep=EgoyMDI2MDQyOC4wIKXMDSoASAFQAw%3D%3D";

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
              Location
            </p>

            <h1 className="mt-3 max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
              Find {brand.gymName}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
              Visit our gym location near Maho Bus Stand. Use the map below to
              get directions and plan your visit.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-5">
              <LocationCard
                icon={<MapPin size={24} />}
                title="Nearby Landmark"
                text="Maho Bus Stand"
                value="Maho, Sri Lanka"
              />

              <LocationCard
                icon={<Navigation size={24} />}
                title="Map Coordinates"
                text="Approximate map location"
                value="7.8216613, 80.2733059"
              />

              <LocationCard
                icon={<Route size={24} />}
                title="Directions"
                text="Open Google Maps to start navigation from your current location."
                value="Google Maps available"
              />

              <LocationCard
                icon={<Clock size={24} />}
                title="Visit Time"
                text="Contact the gym before visiting for updated opening hours."
                value="Open daily"
              />
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-black">Gym Map</h2>
                  <p className="mt-1 text-sm font-semibold text-zinc-500">
                    Maho Bus Stand area location preview.
                  </p>
                </div>

                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:scale-[1.02]"
                >
                  Open in Google Maps <ExternalLink size={16} />
                </a>
              </div>

              <div className="h-[520px] w-full bg-black">
                <iframe
                  title="Dolphin Fitness Center Location"
                  src="https://www.google.com/maps?q=7.8216613,80.2733059&z=18&output=embed"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          <section className="mt-12 rounded-[2rem] border border-white/10 bg-white p-8 text-black shadow-2xl">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
              <div>
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-black text-white">
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

                <h2 className="mt-6 text-3xl font-black">Before You Visit</h2>

                <p className="mt-3 text-sm font-semibold leading-6 text-zinc-600">
                  Bring your basic details for registration. If you want
                  personal training, you can choose a coach during online member
                  registration.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoBox
                  title="Easy Access"
                  text="Located near Maho Bus Stand area."
                />
                <InfoBox
                  title="Membership"
                  text="Monthly and personal training plans available."
                />
                <InfoBox
                  title="Support"
                  text="Admin can help with payment and profile setup."
                />
              </div>
            </div>
          </section>

          <section className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-black">Need help finding us?</h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-zinc-500">
                  Contact the gym team before visiting. We can guide you using
                  the nearby landmark and Google Maps directions.
                </p>
              </div>

              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-black text-black transition hover:scale-[1.02]"
              >
                <Phone size={18} />
                Contact Us
              </a>
            </div>
          </section>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function LocationCard({
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

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-zinc-100 p-5">
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-zinc-600">
        {text}
      </p>
    </div>
  );
}