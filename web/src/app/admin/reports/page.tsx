"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type OrderRow = { status: string; total: number; created_at: string };
type ItemRow = {
  quantity: number;
  unit_price: number;
  products: { name: string } | null;
  orders: { status: string } | null;
};

const DAY = 24 * 60 * 60 * 1000;

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: o, error: e1 } = await supabase
        .from("orders")
        .select("status, total, created_at");
      const { data: i, error: e2 } = await supabase
        .from("order_items")
        .select("quantity, unit_price, products(name), orders(status)");

      if (e1 || e2) setError((e1 ?? e2)!.message);
      setOrders(o ?? []);
      setItems((i ?? []) as unknown as ItemRow[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  const valid = orders.filter((o) => o.status !== "cancelled");
  const now = Date.now();
  const revenueSince = (days: number) =>
    valid
      .filter((o) => now - new Date(o.created_at).getTime() <= days * DAY)
      .reduce((sum, o) => sum + Number(o.total), 0);

  const allRevenue = valid.reduce((sum, o) => sum + Number(o.total), 0);
  const average = valid.length ? allRevenue / valid.length : 0;

  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  });

  const sales: Record<string, { quantity: number; revenue: number }> = {};
  items
    .filter((i) => i.orders?.status !== "cancelled")
    .forEach((i) => {
      const name = i.products?.name ?? "Product removed";
      sales[name] ??= { quantity: 0, revenue: 0 };
      sales[name].quantity += i.quantity;
      sales[name].revenue += i.quantity * Number(i.unit_price);
    });
  const top = Object.entries(sales)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5);

  const cards = [
    { label: "Revenue: last 7 days", value: `$${revenueSince(7).toFixed(2)}` },
    {
      label: "Revenue: last 30 days",
      value: `$${revenueSince(30).toFixed(2)}`,
    },
    { label: "Revenue: all time", value: `$${allRevenue.toFixed(2)}` },
    { label: "Average order value", value: `$${average.toFixed(2)}` },
  ];

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Reports</h1>
      {error && <p className="mb-4 text-red-400">{error}</p>}

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border p-4">
            <p className="text-sm text-gray-400">{c.label}</p>
            <p className="mt-1 text-xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl font-semibold">Orders by status</h2>
          {Object.keys(statusCounts).length === 0 && (
            <p className="text-gray-400">No orders yet.</p>
          )}
          {Object.entries(statusCounts).map(([status, n]) => (
            <div
              key={status}
              className="flex justify-between border-b py-2 capitalize"
            >
              <span>{status}</span>
              <span>{n}</span>
            </div>
          ))}
        </div>

        <div>
          <h2 className="mb-3 text-xl font-semibold">Top selling products</h2>
          {top.length === 0 && <p className="text-gray-400">No sales yet.</p>}
          {top.map(([name, s]) => (
            <div key={name} className="flex justify-between border-b py-2">
              <span>
                {name} <span className="text-gray-400">× {s.quantity}</span>
              </span>
              <span>${s.revenue.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Cancelled orders are not counted in revenue or sales.
      </p>
    </>
  );
}
