import Link from "next/link";
import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase-public";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import Reviews from "@/components/Reviews";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: product } = await supabasePublic
    .from("products")
    .select("id, name, description, price, stock, image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/" className="text-sm text-gray-400">
        ← Back to products
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded bg-gray-100 text-gray-400">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full rounded object-cover"
            />
          ) : (
            "No image"
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-2xl">${Number(product.price).toFixed(2)}</p>
          <p className="mt-4 text-gray-300">{product.description}</p>
          <p className="mt-4 text-sm">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <AddToCartButton
            productId={product.id}
            slug={slug}
            name={product.name}
            price={Number(product.price)}
            imageUrl={product.image_url}
            stock={product.stock}
          />
          <WishlistButton productId={product.id} />
        </div>
      </div>
      <Reviews productId={product.id} />
    </main>
  );
}
