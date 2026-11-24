
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-12">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Civic<span className="text-emerald-400">Proof</span>
        </Link>

        <div className="hidden gap-8 text-sm text-slate-300 md:flex">
          <Link href="#how-it-works">How it works</Link>
          <Link href="#features">Features</Link>
        </div>

        <Link
          href="/report"
          className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          Report an Issue
        </Link>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:px-12">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            A smarter way to improve our cities
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Your city.
            <br />
            Your voice.
            <br />
            <span className="text-emerald-400">
              Verified impact.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
            Report civic problems, share evidence, and help
            communities bring real issues into the spotlight.
            Every report matters.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/report"
              className="rounded-full bg-emerald-400 px-7 py-4 font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Report a Problem →
            </Link>

            <Link
              href="#how-it-works"
              className="rounded-full border border-white/15 px-7 py-4 font-semibold transition hover:bg-white/5"
            >
              Explore CivicProof
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Built for citizens. Designed for transparency.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Civic activity
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  Community overview
                </h2>
              </div>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                Live platform
              </span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-800 p-5">
                <p className="text-sm text-slate-400">
                  Reports submitted
                </p>
                <p className="mt-3 text-3xl font-bold">—</p>
              </div>

              <div className="rounded-2xl bg-slate-800 p-5">
                <p className="text-sm text-slate-400">
                  Issues verified
                </p>
                <p className="mt-3 text-3xl font-bold">—</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-xl">
                  📍
                </div>
                <div>
                  <p className="font-medium">
                    Evidence-based reporting
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Photos, location and issue history
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Dashboard preview · No live data yet
            </p>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-t border-white/10 px-6 py-20 md:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            How it works
          </p>

          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            From problem to proof.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Report",
                description:
                  "Capture a civic issue with a description, photo and location.",
              },
              {
                number: "02",
                title: "Verify",
                description:
                  "Review evidence and identify potentially duplicate reports.",
              },
              {
                number: "03",
                title: "Track",
                description:
                  "Follow the report history and community updates.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="rounded-2xl border border-white/10 bg-slate-900 p-7"
              >
                <p className="text-sm font-semibold text-emerald-400">
                  {item.number}
                </p>
                <h3 className="mt-5 text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        CivicProof · A community-powered civic reporting platform
      </footer>
    </main>
  );
}
