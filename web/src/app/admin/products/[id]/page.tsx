"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductForm, {
  type ProductFormData,
} from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select(
        "id, name, slug, description, price, stock, image_url, is_active, category_id",
      )
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setProduct(data as ProductFormData | null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Edit product</h1>
      <ProductForm product={product} />
    </>
  );
}
