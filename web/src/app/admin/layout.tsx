"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<"loading" | "denied" | "ok">("loading");

  useEffect(() => {
    async function check() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setStatus("denied");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();
      setStatus(data?.role === "admin" ? "ok" : "denied");
    }
    check();
  }, []);

  if (status === "loading") {
    return <main className="p-6">Loading...</main>;
  }

  if (status === "denied") {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="mb-2 text-2xl font-bold">Access denied</h1>
        <p className="mb-4 text-gray-300">
          You need an admin account to view this area.
        </p>
        <Link href="/" className="underline">
          Back to the store
        </Link>
      </main>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <nav className="mb-6 flex gap-4 border-b pb-3">
        <Link href="/admin" className="font-semibold">
          Dashboard
        </Link>
        <Link href="/admin/products">Products</Link>
        <Link href="/admin/orders">Orders</Link>
      </nav>
      {children}
    </div>
  );
}
