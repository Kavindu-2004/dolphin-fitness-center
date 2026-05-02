const gymVideos = [
  {
    title: "Strength Zone",
    text: "Train harder with modern gym equipment and a focused fitness environment.",
    src: "/videos/gym-1.mp4",
  },
  {
    title: "Cardio & Fitness",
    text: "Improve endurance, burn calories, and stay consistent with your goals.",
    src: "/videos/gym-2.mp4",
  },
  {
    title: "Personal Training",
    text: "Work with expert coaches for guided progress and better transformation.",
    src: "/videos/gym-3.mp4",
  },
];

export default function GymVideoShowcase() {
  return (
    <section className="relative z-10 border-y border-white/10 bg-white/[0.03]">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-bold uppercase tracking-[0.3em] text-zinc-500">
              Gym Experience
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              See the training atmosphere
            </h2>
          </div>

          <p className="max-w-xl text-zinc-400">
            Watch real gym moments from the training floor, cardio area, and
            coaching sessions.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {gymVideos.map((video) => (
            <div
              key={video.src}
              className="shine-effect overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur transition duration-300 hover:-translate-y-2 hover:bg-white/10"
            >
              <div className="relative aspect-video overflow-hidden bg-black">
                <video
                  src={video.src}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-black">{video.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {video.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}