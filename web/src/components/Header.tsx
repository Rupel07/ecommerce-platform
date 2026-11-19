"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/components/CartProvider";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    function update(u: User | null) {
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        return;
      }
      supabase
        .from("profiles")
        .select("role")
        .eq("id", u.id)
        .single()
        .then(({ data }) => setIsAdmin(data?.role === "admin"));
    }

    supabase.auth.getUser().then(({ data }) => update(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      update(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          My Store
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/cart">Cart ({count})</Link>
          {user ? (
            <>
              {isAdmin && <Link href="/admin">Admin</Link>}
              <Link href="/wishlist">Wishlist</Link>
              <Link href="/orders">My orders</Link>
              <span className="text-sm text-gray-500">{user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded border px-3 py-1"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link
                href="/register"
                className="rounded bg-white px-3 py-1 text-black"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
