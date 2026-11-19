"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image_url: string | null;
};

type Item = { product_id: number; products: Product | null };

export default function WishlistPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }
      setUserId(userData.user.id);

      const { data, error } = await supabase
        .from("wishlist_items")
        .select(
          "product_id, products(id, name, slug, price, stock, image_url)",
        );

      if (error) setError(error.message);
      else setItems((data ?? []) as unknown as Item[]);
      setLoading(false);
    }
    load();
  }, []);

  async function remove(productId: number) {
    if (!userId) return;
    await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
    setItems((current) => current.filter((i) => i.product_id !== productId));
  }

  if (loading) return <main className="p-6">Loading...</main>;

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-3xl font-bold">My Wishlist</h1>
        <p className="mb-4 text-gray-300">
          Please log in to see your wishlist.
        </p>
        <Link href="/login" className="rounded bg-white px-4 py-2 text-black">
          Log in
        </Link>
      </main>
    );
  }

  const visible = items.filter((i) => i.products);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold">My Wishlist</h1>
      {error && <p className="mb-4 text-red-400">{error}</p>}

      {visible.length === 0 && !error && (
        <>
          <p className="text-gray-400">Your wishlist is empty.</p>
          <Link href="/" className="mt-4 inline-block underline">
            Browse products
          </Link>
        </>
      )}

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {visible.map(({ product_id, products: p }) => (
          <div key={product_id} className="rounded-lg border p-4">
            <Link href={`/products/${p!.slug}`}>
              <div className="mb-3 flex aspect-square items-center justify-center rounded bg-gray-100 text-sm text-gray-400">
                {p!.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p!.image_url}
                    alt={p!.name}
                    className="h-full w-full rounded object-cover"
                  />
                ) : (
                  "No image"
                )}
              </div>
              <h2 className="font-semibold">{p!.name}</h2>
              <p className="text-gray-300">${Number(p!.price).toFixed(2)}</p>
            </Link>

            <AddToCartButton
              productId={p!.id}
              slug={p!.slug}
              name={p!.name}
              price={Number(p!.price)}
              imageUrl={p!.image_url}
              stock={p!.stock}
            />
            <button
              onClick={() => remove(product_id)}
              className="mt-3 w-full text-sm text-red-400 underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
