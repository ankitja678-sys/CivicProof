
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ReportPage() {
  const [category, setCategory] = useState("Road Damage");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportId, setReportId] = useState("");

  useEffect(() => {
    if (!photo) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function handlePhotoChange(file: File | null) {
    setError("");

    if (!file) {
      setPhoto(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      setPhoto(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must be 5 MB or less.");
      setPhoto(null);
      return;
    }

    setPhoto(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const id = crypto.randomUUID();

    try {
      let evidencePath: string | null = null;

      // 1. Upload evidence photo if one was selected
      if (photo) {
        const extension = photo.name.split(".").pop()?.toLowerCase();

        if (!extension) {
          throw new Error("Could not determine image file extension.");
        }

        evidencePath = `${id}/evidence.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("civic-evidence")
          .upload(evidencePath, photo, {
            contentType: photo.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Photo upload failed: ${uploadError.message}`
          );
        }
      }

      // 2. Save report details and photo path in database
      const { error: insertError } = await supabase
        .from("civic_reports")
        .insert({
          id,
          category,
          description: description.trim(),
          location: location.trim(),
          evidence_path: evidencePath,
        });

      if (insertError) {
        console.error("SUPABASE INSERT ERROR:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        });

        throw new Error(insertError.message);
      }

      // 3. Show report confirmation
      setReportId(id);
    } catch (err: unknown) {
      console.error("REPORT SUBMISSION FAILED:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setCategory("Road Damage");
    setDescription("");
    setLocation("");
    setPhoto(null);
    setError("");
    setReportId("");
  }

  if (reportId) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-500/30 bg-emerald-950/40 p-8">
          <h1 className="mb-4 text-3xl font-bold text-emerald-400">
            Report submitted successfully!
          </h1>

          <p className="mb-8 text-lg text-slate-300">
            Your report has been saved in the CivicProof database.
          </p>

          <div className="mb-8 rounded-2xl bg-slate-900 p-6">
            <p className="mb-2 text-slate-400">
              Your CivicProof Report ID
            </p>

            <p className="break-all text-xl font-semibold text-emerald-400">
              {reportId}
            </p>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(reportId);
              }}
              className="mt-4 text-emerald-400 underline"
            >
              Copy Report ID
            </button>
          </div>

          <p className="mb-8 text-slate-300">
            Status: Pending verification
          </p>

          {photo && (
            <p className="mb-6 text-emerald-300">
              Evidence photo uploaded successfully.
            </p>
          )}

          <button
            type="button"
            onClick={resetForm}
            className="rounded-full bg-emerald-500 px-8 py-4 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Submit Another Report
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-block text-emerald-400 hover:underline"
        >
          ← Back to Home
        </Link>

        <h1 className="mb-4 text-4xl font-bold">
          Report a Civic Issue
        </h1>

        <p className="mb-10 text-lg text-slate-400">
          Help improve your community by reporting problems with
          accurate information and supporting evidence.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-8"
        >
          <div>
            <label
              htmlFor="category"
              className="mb-2 block font-medium"
            >
              Issue Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
            >
              <option>Road Damage</option>
              <option>Garbage Accumulation</option>
              <option>Broken Streetlight</option>
              <option>Water Leakage</option>
              <option>Drainage Problem</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              required
              minLength={10}
              maxLength={1000}
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the civic issue..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
            />
            <p className="mt-1 text-sm text-slate-500">
              {description.length}/1000 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-2 block font-medium"
            >
              Issue Location
            </label>

            <input
              id="location"
              required
              minLength={3}
              maxLength={300}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Street, area, city"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
            />
          </div>

          <div>
            <label
              htmlFor="photo"
              className="mb-2 block font-medium"
            >
              Evidence Photo (Optional)
            </label>

            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                handlePhotoChange(event.target.files?.[0] ?? null)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
            />

            <p className="mt-2 text-sm text-slate-500">
              JPG, PNG or WEBP. Maximum size: 5 MB.
            </p>

            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Selected evidence preview"
                  className="max-h-72 rounded-xl border border-slate-700 object-contain"
                />

                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="mt-3 text-sm text-red-400 underline"
                >
                  Remove photo
                </button>
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="whitespace-pre-wrap rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-500 px-8 py-4 font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting Report..." : "Submit Report"}
          </button>
        </form>
      </div>
    </main>
  );
}
