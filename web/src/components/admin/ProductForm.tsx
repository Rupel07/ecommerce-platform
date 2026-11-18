"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Category = { id: number; name: string };

export type ProductFormData = {
  id?: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  category_id: number | null;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductForm({
  product,
}: {
  product?: ProductFormData;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? "0"));
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [categoryId, setCategoryId] = useState(
    String(product?.category_id ?? ""),
  );
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const row = {
      name,
      slug: slug || slugify(name),
      description: description || null,
      price: Number(price),
      stock: Number(stock),
      image_url: imageUrl || null,
      category_id: categoryId ? Number(categoryId) : null,
      is_active: isActive,
    };

    const { error } = product?.id
      ? await supabase.from("products").update(row).eq("id", product.id)
      : await supabase.from("products").insert(row);

    setSaving(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/admin/products");
      router.refresh();
    }
  }

  const input = "rounded border bg-transparent p-2";

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <input
        className={input}
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className={input}
        placeholder="URL slug (leave empty to generate from name)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <textarea
        className={input}
        placeholder="Description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-4">
        <input
          className={`${input} w-full`}
          type="number"
          step="0.01"
          min="0"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          className={`${input} w-full`}
          type="number"
          min="0"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />
      </div>
      <select
        className={input}
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="" className="text-black">
          No category
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id} className="text-black">
            {c.name}
          </option>
        ))}
      </select>
      <input
        className={input}
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Visible in the store
      </label>

      <button
        disabled={saving}
        className="rounded bg-white p-3 font-semibold text-black"
      >
        {saving ? "Saving..." : product?.id ? "Save changes" : "Add product"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
