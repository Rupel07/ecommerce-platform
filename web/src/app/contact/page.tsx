"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // hidden spam trap
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Bots tend to fill in every field, including the hidden one
    if (website) {
      setSent(true);
      return;
    }

    setSending(true);
    const { error } = await supabase.rpc("submit_contact_message", {
      p_name: name,
      p_email: email,
      p_subject: subject,
      p_message: message,
    });
    setSending(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="mb-4 text-3xl font-bold">Message sent</h1>
        <p className="text-gray-300">
          Thank you for contacting us. We will get back to you as soon as we
          can.
        </p>
      </main>
    );
  }

  const input = "rounded border bg-transparent p-2";

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Contact us</h1>
      <p className="mb-6 text-gray-300">
        Have a question about a product or an order? Send us a message.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className={input}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
        />
        <input
          className={input}
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={input}
          placeholder="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={150}
        />
        <textarea
          className={input}
          placeholder="Your message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          required
        />

        {/* Hidden spam trap: real visitors never see or fill this in */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px]"
        />

        <button
          disabled={sending}
          className="rounded bg-white p-3 font-semibold text-black"
        >
          {sending ? "Sending..." : "Send message"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </main>
  );
}
