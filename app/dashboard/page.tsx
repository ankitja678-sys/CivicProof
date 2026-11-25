
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CivicReport = {
  id: string;
  category: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [reports, setReports] = useState<CivicReport[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadDashboard() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        if (cancelled) return;

        setUserEmail(user.email ?? "");

        const { data, error: reportsError } = await supabase
          .from("civic_reports")
          .select(
            "id, category, description, location, status, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (reportsError) {
          throw reportsError;
        }

        if (!cancelled) {
          setReports(data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Dashboard load nahi ho paya."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    const supabase = createClient();
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  const pendingReports = reports.filter(
    (report) => report.status === "pending"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-cyan-400"
            >
              CivicProof
            </Link>

            <h1 className="mt-4 text-3xl font-bold">
              My Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Welcome, {userEmail || "CivicProof user"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-300">
              Loading your dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <section className="mb-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  Total Reports
                </p>

                <p className="mt-3 text-4xl font-bold">
                  {reports.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  Pending Reports
                </p>

                <p className="mt-3 text-4xl font-bold text-amber-400">
                  {pendingReports}
                </p>
              </div>
            </section>

            {/* New Report Button */}
            <div className="mb-8">
              <Link
                href="/report"
                className="inline-flex rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                + Report New Issue
              </Link>
            </div>

            {/* Reports */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  My Reports
                </h2>

                <span className="text-sm text-slate-400">
                  {reports.length} total
                </span>
              </div>

              {reports.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
                  <div className="mb-4 text-4xl">📋</div>

                  <h3 className="text-lg font-semibold">
                    No reports yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Civic issue report karo. Tumhari reports
                    yahan dikhengi.
                  </p>

                  <Link
                    href="/report"
                    className="mt-6 inline-block rounded-xl border border-cyan-500 px-5 py-2.5 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/10"
                  >
                    Submit Your First Report
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <article
                      key={report.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {report.category}
                          </h3>

                          <p className="mt-2 text-sm text-slate-300">
                            {report.description}
                          </p>
                        </div>

                        <span className="w-fit rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold capitalize text-amber-400">
                          {report.status}
                        </span>
                      </div>

                      <div className="mt-5 space-y-2 text-sm text-slate-400">
                        <p>
                          <span className="text-slate-300">
                            Location:
                          </span>{" "}
                          {report.location}
                        </p>

                        <p>
                          <span className="text-slate-300">
                            Submitted:
                          </span>{" "}
                          {new Date(
                            report.created_at
                          ).toLocaleString("en-IN")}
                        </p>

                        <p className="break-all">
                          <span className="text-slate-300">
                            Report ID:
                          </span>{" "}
                          {report.id}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
