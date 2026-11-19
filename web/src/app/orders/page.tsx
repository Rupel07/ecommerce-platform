"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { storeConfig } from "@/lib/store-config";

type OrderItem = {
  quantity: number;
  unit_price: number;
  products: { name: string; slug: string } | null;
};

type Order = {
  id: number;
  status: string;
  total: number;
  created_at: string;
  payment_method: string;
  shipping_address: string | null;
  order_items: OrderItem[];
};

const STEPS = ["pending", "processing", "shipped", "delivered"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS: Record<string, string> = {
  bank_transfer: "Bank transfer",
  cash_on_delivery: "Pay on delivery",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }
      setLoggedIn(true);

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, status, total, created_at, payment_method, shipping_address, order_items(quantity, unit_price, products(name, slug))",
        )
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setOrders((data ?? []) as unknown as Order[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <main className="p-6">Loading...</main>;
  }

  if (!loggedIn) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-3xl font-bold">My Orders</h1>
        <p className="mb-4 text-gray-300">Please log in to see your orders.</p>
        <Link href="/login" className="rounded bg-white px-4 py-2 text-black">
          Log in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">My Orders</h1>

      {error && (
        <p className="mb-4 text-red-400">Could not load orders: {error}</p>
      )}

      {orders.length === 0 && !error && (
        <>
          <p className="text-gray-400">You have no orders yet.</p>
          <Link href="/" className="mt-4 inline-block underline">
            Start shopping
          </Link>
        </>
      )}

      <div className="flex flex-col gap-6">
        {orders.map((order) => {
          const stepIndex = STEPS.indexOf(
            order.status === "paid" ? "pending" : order.status,
          );
          const cancelled = order.status === "cancelled";

          return (
            <div key={order.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()} ·{" "}
                    {PAYMENT_LABELS[order.payment_method] ??
                      order.payment_method}
                  </p>
                </div>
                <span
                  className={`rounded px-3 py-1 text-sm ${
                    cancelled
                      ? "bg-red-900 text-red-200"
                      : "bg-white text-black"
                  }`}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>

              {order.payment_method === "bank_transfer" &&
                order.payment_status === "unpaid" &&
                !cancelled && (
                  <div className="my-4 flex gap-1">
                    {STEPS.map((step, i) => (
                      <div key={step} className="flex-1">
                        <div
                          className={`h-1 rounded ${i <= stepIndex ? "bg-white" : "bg-gray-700"}`}
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          {STATUS_LABELS[step]}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              <div className="mt-3 border-t pt-3">
                {order.order_items.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm">
                    <span>
                      {item.products ? (
                        <Link
                          href={`/products/${item.products.slug}`}
                          className="underline"
                        >
                          {item.products.name}
                        </Link>
                      ) : (
                        "Product removed"
                      )}{" "}
                      × {item.quantity}
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

              {order.shipping_address && (
                <p className="mt-3 text-sm text-gray-400">
                  Delivering to: {order.shipping_address}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
