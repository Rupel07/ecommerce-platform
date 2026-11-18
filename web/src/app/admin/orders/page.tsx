"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
  status: string;
  total: number;
  created_at: string;
  payment_method: string;
  shipping_name: string | null;
  phone: string | null;
  shipping_address: string | null;
  order_items: {
    quantity: number;
    unit_price: number;
    products: { name: string } | null;
  }[];
};

const STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_LABELS: Record<string, string> = {
  bank_transfer: "Bank transfer",
  cash_on_delivery: "Pay on delivery",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, status, total, created_at, payment_method, shipping_name, phone, shipping_address, order_items(quantity, unit_price, products(name))",
      )
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setOrders((data ?? []) as unknown as Order[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(orderId: number, status: string) {
    setError("");
    const { error } = await supabase.rpc("admin_set_order_status", {
      p_order_id: orderId,
      p_status: status,
    });
    if (error) setError(error.message);
    await load();
  }

  if (loading) return <p>Loading...</p>;

  const shown =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">Orders</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded border px-3 py-1 capitalize ${
              filter === s ? "bg-white text-black" : ""
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-red-400">{error}</p>}
      {shown.length === 0 && <p className="text-gray-400">No orders found.</p>}

      <div className="flex flex-col gap-4">
        {shown.map((order) => (
          <div key={order.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-sm text-gray-400">
                  {new Date(order.created_at).toLocaleString()} ·{" "}
                  {PAYMENT_LABELS[order.payment_method] ?? order.payment_method}
                </p>
              </div>

              <select
                value={order.status}
                onChange={(e) => changeStatus(order.id, e.target.value)}
                disabled={order.status === "cancelled"}
                className="rounded border bg-transparent p-2 capitalize"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="text-black">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 text-sm text-gray-300">
              <p>
                {order.shipping_name} · {order.phone}
              </p>
              <p>{order.shipping_address}</p>
            </div>

            <div className="mt-3 border-t pt-3 text-sm">
              {order.order_items.map((item, i) => (
                <div key={i} className="flex justify-between py-1">
                  <span>
                    {item.products?.name ?? "Product removed"} × {item.quantity}
                  </span>
                  <span>
                    ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t pt-2 font-bold">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
