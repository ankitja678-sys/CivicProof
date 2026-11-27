
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Report = {
  id: string;
  category: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
  evidence_path: string | null;
  evidence_url: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReports() {
      const supabase = createClient();

      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.replace("/login");
          return;
        }

        const { data, error: reportsError } = await supabase
          .from("civic_reports")
          .select(
            "id, category, description, location, status, created_at, evidence_path"
          )
          .eq("user_id", authData.user.id)
          .order("created_at", { ascending: false });

        if (reportsError) {
          throw reportsError;
        }

        const rows = (data ?? []) as Omit<Report, "evidence_url">[];

        const reportsWithPhotos: Report[] = await Promise.all(
          rows.map(async (report) => {
            if (!report.evidence_path) {
              return {
                ...report,
                evidence_url: null,
              };
            }

            const { data: signedData, error: signedError } =
              await supabase.storage
                .from("civic-evidence")
                .createSignedUrl(report.evidence_path, 60 * 60);

            if (signedError) {
              console.error(
                "Could not create evidence preview:",
                signedError.message
              );
            }

            return {
              ...report,
              evidence_url: signedData?.signedUrl ?? null,
            };
          })
        );

        if (active) {
          setReports(reportsWithPhotos);
        }
      } catch (err) {
        console.error("Dashboard error:", err);

        if (active) {
          setError("Reports load nahi ho paaye. Please refresh and try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const pendingReports = reports.filter(
    (report) => report.status === "pending"
  ).length;

  function formatStatus(status: string) {
    return status.replaceAll("_", " ");
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-cyan-400"
            >
              CivicProof
            </Link>

            <h1 className="mt-5 text-3xl font-bold">My Dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">
              Track your civic issue reports.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold hover:bg-slate-800"
          >
            Logout
          </button>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total Reports</p>
            <p className="mt-3 text-4xl font-bold">{reports.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Pending Reports</p>
            <p className="mt-3 text-4xl font-bold text-amber-400">
              {pendingReports}
            </p>
          </div>
        </section>

        <Link
          href="/report"
          className="mb-10 inline-block rounded-xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 hover:bg-cyan-400"
        >
          + Report New Issue
        </Link>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Reports</h2>
            <span className="text-sm text-slate-400">
              {reports.length} total
            </span>
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
              Loading your reports...
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-950 p-4 text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && reports.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
              <h3 className="text-xl font-semibold">No reports yet</h3>
              <p className="mt-2 text-slate-400">
                Civic issue report karo. Tumhari reports yahan dikhenge.
              </p>
              <Link
                href="/report"
                className="mt-6 inline-block rounded-xl border border-cyan-500 px-5 py-3 font-semibold text-cyan-400 hover:bg-cyan-950"
              >
                Submit Your First Report
              </Link>
            </div>
          )}

          <div className="space-y-5">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-xl font-bold">{report.category}</h3>

                  <span className="rounded-full bg-amber-950 px-3 py-1 text-xs font-semibold capitalize text-amber-400">
                    {formatStatus(report.status)}
                  </span>
                </div>

                <p className="mt-4 text-slate-300">
                  {report.description}
                </p>

                <p className="mt-3 text-sm text-slate-400">
                  Location: {report.location}
                </p>

                <p className="mt-3 text-sm text-slate-400">
                  Submitted:{" "}
                  {new Date(report.created_at).toLocaleString("en-IN")}
                </p>

                <p className="mt-3 break-all text-sm text-slate-500">
                  Report ID: {report.id}
                </p>

                {report.evidence_url && (
                  <div className="mt-5">
                    <p className="mb-3 text-sm font-semibold text-slate-300">
                      Uploaded Evidence
                    </p>

                    <a
                      href={report.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={report.evidence_url}
                        alt="Evidence uploaded with this civic report"
                        className="max-h-72 w-full rounded-xl border border-slate-700 object-contain object-left"
                      />
                    </a>

                    <p className="mt-2 text-xs text-slate-500">
                      Secure temporary link · Expires in 1 hour
                    </p>
                  </div>
                )}

                {report.evidence_path && !report.evidence_url && (
                  <p className="mt-4 text-sm text-amber-400">
                    Evidence photo preview is temporarily unavailable.
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
