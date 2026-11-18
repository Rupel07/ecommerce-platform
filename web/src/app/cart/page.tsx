"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-3xl font-bold">Your Cart</h1>
        <p className="text-gray-400">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block underline">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-lg border p-4"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full rounded object-cover"
                />
              ) : (
                "No image"
              )}
            </div>

            <div className="flex-1">
              <Link href={`/products/${item.slug}`} className="font-semibold">
                {item.name}
              </Link>
              <p className="text-gray-300">${item.price.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateQuantity(item.productId, item.quantity - 1)
                }
                className="h-8 w-8 rounded border"
              >
                −
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                onClick={() =>
                  updateQuantity(item.productId, item.quantity + 1)
                }
                disabled={item.quantity >= item.stock}
                className="h-8 w-8 rounded border disabled:opacity-40"
              >
                +
              </button>
            </div>

            <p className="w-20 text-right">
              ${(item.price * item.quantity).toFixed(2)}
            </p>

            <button
              onClick={() => removeItem(item.productId)}
              className="text-sm text-red-400"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
        <Link
          href="/checkout"
          className="rounded bg-white px-6 py-3 font-semibold text-black"
        >
          Checkout
        </Link>
      </div>
    </main>
  );
}
