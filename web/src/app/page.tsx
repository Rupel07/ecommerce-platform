import Link from "next/link";
import { supabasePublic } from "@/lib/supabase-public";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const { data: categories } = await supabasePublic
    .from("categories")
    .select("id, name, slug")
    .order("name");

  let query = supabasePublic
    .from("products")
    .select("id, name, slug, price, image_url")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const selected = categories?.find((c) => c.slug === category);
  if (selected) query = query.eq("category_id", selected.id);
  if (q) query = query.ilike("name", `%${q}%`);

  const { data: products, error } = await query;

  if (error) {
    return <p className="p-8">Could not load products: {error.message}</p>;
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Our Products</h1>

      <form action="/" className="mb-4 flex gap-2">
        {selected && (
          <input type="hidden" name="category" value={selected.slug} />
        )}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="w-full max-w-sm rounded border bg-transparent p-2"
        />
        <button className="rounded border px-4">Search</button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/"
          className={`rounded border px-3 py-1 ${!selected ? "bg-white text-black" : ""}`}
        >
          All
        </Link>
        {categories?.map((c) => (
          <Link
            key={c.id}
            href={`/?category=${c.slug}`}
            className={`rounded border px-3 py-1 ${selected?.id === c.id ? "bg-white text-black" : ""}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products?.length === 0 && (
        <p className="text-gray-400">No products found.</p>
      )}

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products?.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="rounded-lg border p-4 hover:border-white"
          >
            <div className="mb-3 flex aspect-square items-center justify-center rounded bg-gray-100 text-sm text-gray-400">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="h-full w-full rounded object-cover"
                />
              ) : (
                "No image"
              )}
            </div>
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-gray-300">${Number(p.price).toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
