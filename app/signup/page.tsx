
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

      if (signupError) {
        throw signupError;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setSuccess(
          "Account created! Please check your email and click the verification link before logging in."
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Account creation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <Link
          href="/"
          className="text-sm text-emerald-400 hover:underline"
        >
          ← Back to Home
        </Link>

        <h1 className="mt-8 text-3xl font-bold">
          Create your account
        </h1>

        <p className="mt-2 text-slate-400">
          Join CivicProof and help improve your community.
        </p>

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 outline-none focus:border-emerald-500"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="rounded-lg bg-emerald-950 p-3 text-sm text-emerald-300">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-500 px-6 py-4 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-400 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
