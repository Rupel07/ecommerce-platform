"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
};

type OrderRow = { user_id: string; total: number; status: string };

export default function AdminCustomersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: p, error: e1 } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false });
      const { data: o, error: e2 } = await supabase
        .from("orders")
        .select("user_id, total, status");

      if (e1 || e2) setError((e1 ?? e2)!.message);
      setProfiles(p ?? []);
      setOrders(o ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Customers</h1>
      {error && <p className="mb-4 text-red-400">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm text-gray-400">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Joined</th>
              <th className="p-2">Orders</th>
              <th className="p-2">Total spent</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => {
              const mine = orders.filter((o) => o.user_id === p.id);
              const spent = mine
                .filter((o) => o.status !== "cancelled")
                .reduce((sum, o) => sum + Number(o.total), 0);
              return (
                <tr key={p.id} className="border-b">
                  <td className="p-2">
                    {p.full_name ?? "—"}
                    {p.role === "admin" && (
                      <span className="ml-2 rounded bg-white px-2 py-0.5 text-xs text-black">
                        admin
                      </span>
                    )}
                  </td>
                  <td className="p-2">{p.email ?? "—"}</td>
                  <td className="p-2">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-2">{mine.length}</td>
                  <td className="p-2">${spent.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
