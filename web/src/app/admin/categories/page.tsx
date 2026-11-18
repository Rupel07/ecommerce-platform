"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = {
  id: number;
  name: string;
  slug: string;
  products: { count: number }[];
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, products(count)")
      .order("name");
    if (error) setError(error.message);
    else setCategories((data ?? []) as unknown as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await supabase
      .from("categories")
      .insert({ name, slug: slugify(name) });
    if (error) {
      setError(error.message);
    } else {
      setName("");
      load();
    }
  }

  async function handleSave(id: number) {
    setError("");
    const { error } = await supabase
      .from("categories")
      .update({ name: editName, slug: slugify(editName) })
      .eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      setEditingId(null);
      load();
    }
  }

  async function handleDelete(c: Category) {
    if (!confirm(`Delete the category "${c.name}"?`)) return;
    setError("");
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) setError(error.message);
    else load();
  }

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Categories</h1>

      <form onSubmit={handleAdd} className="mb-6 flex max-w-md gap-2">
        <input
          className="w-full rounded border bg-transparent p-2"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button className="rounded bg-white px-4 font-semibold text-black">
          Add
        </button>
      </form>

      {error && <p className="mb-4 text-red-400">{error}</p>}

      <table className="w-full max-w-2xl text-left">
        <thead>
          <tr className="border-b text-sm text-gray-400">
            <th className="p-2">Name</th>
            <th className="p-2">Products</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => {
            const count = c.products?.[0]?.count ?? 0;
            return (
              <tr key={c.id} className="border-b">
                <td className="p-2">
                  {editingId === c.id ? (
                    <input
                      className="rounded border bg-transparent p-1"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="p-2">{count}</td>
                <td className="flex gap-3 p-2">
                  {editingId === c.id ? (
                    <>
                      <button
                        onClick={() => handleSave(c.id)}
                        className="underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="underline"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditName(c.name);
                        }}
                        className="underline"
                      >
                        Rename
                      </button>
                      {count === 0 ? (
                        <button
                          onClick={() => handleDelete(c)}
                          className="text-red-400 underline"
                        >
                          Delete
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">In use</span>
                      )}
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
