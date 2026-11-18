"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Row = {
  id: number;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
  categories: { name: string } | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, stock, is_active, categories(name)")
      .order("id");
    if (error) setError(error.message);
    else setProducts((data ?? []) as unknown as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(p: Row) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (error) setError(error.message);
    else load();
  }

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded bg-white px-4 py-2 font-semibold text-black"
        >
          Add product
        </Link>
      </div>

      {error && <p className="mb-4 text-red-400">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm text-gray-400">
              <th className="p-2">Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Price</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.categories?.name ?? "—"}</td>
                <td className="p-2">${Number(p.price).toFixed(2)}</td>
                <td className={`p-2 ${p.stock <= 5 ? "text-red-400" : ""}`}>
                  {p.stock}
                </td>
                <td className="p-2">{p.is_active ? "Visible" : "Hidden"}</td>
                <td className="flex gap-3 p-2">
                  <Link href={`/admin/products/${p.id}`} className="underline">
                    Edit
                  </Link>
                  <button onClick={() => toggleActive(p)} className="underline">
                    {p.is_active ? "Hide" : "Show"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
