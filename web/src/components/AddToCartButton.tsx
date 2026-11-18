"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";

type Props = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
};

export default function AddToCartButton(props: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (props.stock <= 0) {
    return (
      <button disabled className="mt-6 w-full rounded border p-3 text-gray-500">
        Out of stock
      </button>
    );
  }

  function handleClick() {
    addItem(props);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      className="mt-6 w-full rounded bg-white p-3 font-semibold text-black"
    >
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
