"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setMessage(
        "Account created. Check your email to confirm it, then log in.",
      );
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-bold">Create an account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="rounded border bg-transparent p-2"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          className="rounded border bg-transparent p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="rounded border bg-transparent p-2"
          type="password"
          placeholder="Password (at least 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button
          disabled={loading}
          className="rounded bg-white p-2 font-semibold text-black"
        >
          {loading ? "Creating..." : "Sign up"}
        </button>
        {message && <p className="text-sm text-gray-400">{message}</p>}
      </form>
    </main>
  );
}
