"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WishlistButton({ productId }: { productId: number }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        const { data: row } = await supabase
          .from("wishlist_items")
          .select("product_id")
          .eq("user_id", data.user.id)
          .eq("product_id", productId)
          .maybeSingle();
        setSaved(!!row);
      }
      setReady(true);
    }
    load();
  }, [productId]);

  async function toggle() {
    if (!userId) return;
    setBusy(true);
    if (saved) {
      await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);
      setSaved(false);
    } else {
      await supabase
        .from("wishlist_items")
        .insert({ user_id: userId, product_id: productId });
      setSaved(true);
    }
    setBusy(false);
  }

  if (!ready) return null;

  if (!userId) {
    return (
      <Link href="/login" className="mt-3 block text-center text-sm underline">
        Log in to save this to your wishlist
      </Link>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="mt-3 w-full rounded border p-3"
    >
      {saved ? "♥ Saved to wishlist (click to remove)" : "♡ Add to wishlist"}
    </button>
  );
}
