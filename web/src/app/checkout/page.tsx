"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/components/CartProvider";
import { storeConfig } from "@/lib/store-config";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("bank_transfer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paidTotal, setPaidTotal] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthChecked(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.rpc("place_order", {
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      p_name: name,
      p_phone: phone,
      p_address: address,
      p_payment: payment,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setPaidTotal(total);

    clearCart();
    setOrderId(data as number);
  }

  if (orderId) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="mb-4 text-3xl font-bold">Thank you!</h1>
        <p>
          Your order <strong>#{orderId}</strong> has been placed.
        </p>
        {payment === "bank_transfer" && (
          <div className="mt-4 rounded border p-4 text-gray-300">
            <p className="mb-2 font-semibold text-white">
              Pay by bank transfer
            </p>
            <p>Bank: {storeConfig.bank.bankName}</p>
            <p>Account name: {storeConfig.bank.accountName}</p>
            <p>Account number: {storeConfig.bank.accountNumber}</p>
            <p>Amount: ${paidTotal.toFixed(2)}</p>
            <p>Reference: Order #{orderId}</p>
            <p className="mt-2 text-sm">
              Use your internet or mobile banking app. Please put the order
              number as the payment reference. We will confirm your order once
              the payment arrives.
            </p>
          </div>
        )}
        {payment === "card" && (
          <p className="mt-4 text-gray-300">
            Your order is awaiting card payment. We will contact you shortly
            with a secure way to pay by card.
          </p>
        )}
        {payment === "cash_on_delivery" && (
          <p className="mt-4 text-gray-300">
            Please have the cash ready when your order is delivered.
          </p>
        )}
        <Link href="/orders" className="mt-6 mr-4 inline-block underline">
          View my orders
        </Link>
        <Link href="/" className="inline-block underline">
          Continue shopping
        </Link>
      </main>
    );
  }

  if (!authChecked) {
    return <main className="p-6">Loading...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="mb-4 text-3xl font-bold">Checkout</h1>
        <p className="mb-4 text-gray-300">
          Please log in or create an account to place your order.
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="rounded border px-4 py-2">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded bg-white px-4 py-2 text-black"
          >
            Sign up
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="mb-4 text-3xl font-bold">Checkout</h1>
        <p className="text-gray-400">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block underline">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <div className="mb-6 rounded-lg border p-4">
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between py-1">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>${(i.price * i.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t pt-2 font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="rounded border bg-transparent p-2"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="rounded border bg-transparent p-2"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <textarea
          className="rounded border bg-transparent p-2"
          placeholder="Delivery address"
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-semibold">Payment method</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="bank_transfer"
              checked={payment === "bank_transfer"}
              onChange={(e) => setPayment(e.target.value)}
            />
            Bank transfer (internet or mobile banking)
          </label>
          {storeConfig.cardPaymentsEnabled && (
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={payment === "card"}
                onChange={(e) => setPayment(e.target.value)}
              />
              Card payment
            </label>
          )}
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="cash_on_delivery"
              checked={payment === "cash_on_delivery"}
              onChange={(e) => setPayment(e.target.value)}
            />
            Cash on delivery
          </label>
        </fieldset>

        <button
          disabled={loading}
          className="rounded bg-white p-3 font-semibold text-black"
        >
          {loading ? "Placing order..." : "Place order"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </main>
  );
}
