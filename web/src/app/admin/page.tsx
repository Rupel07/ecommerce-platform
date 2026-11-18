"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminHome() {
  const [stats, setStats] = useState({
    products: 0,
    lowStock: 0,
    orders: 0,
    pending: 0,
    revenue: 0,
  });

  useEffect(() => {
    async function load() {
      const { data: products } = await supabase
        .from("products")
        .select("stock");
      const { data: orders } = await supabase
        .from("orders")
        .select("status, total");

      setStats({
        products: products?.length ?? 0,
        lowStock: products?.filter((p) => p.stock <= 5).length ?? 0,
        orders: orders?.length ?? 0,
        pending: orders?.filter((o) => o.status === "pending").length ?? 0,
        revenue:
          orders
            ?.filter((o) => o.status !== "cancelled")
            .reduce((sum, o) => sum + Number(o.total), 0) ?? 0,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Products", value: stats.products },
    { label: "Low stock (5 or fewer)", value: stats.lowStock },
    { label: "Total orders", value: stats.orders },
    { label: "Pending orders", value: stats.pending },
    {
      label: "Revenue (excl. cancelled)",
      value: `$${stats.revenue.toFixed(2)}`,
    },
  ];

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border p-4">
            <p className="text-sm text-gray-400">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
