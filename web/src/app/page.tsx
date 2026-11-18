import { createClient } from "@supabase/supabase-js";

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, price, image_url, categories(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="p-8">Could not load products: {error.message}</p>;
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Our Products</h1>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products?.map((p) => (
          <div key={p.id} className="rounded-lg border p-4">
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
            <p className="text-gray-600">${Number(p.price).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
