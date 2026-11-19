"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Review = {
  id: number;
  user_id: string;
  rating: number;
  comment: string | null;
  reviewer_name: string | null;
  created_at: string;
};

function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`${value} out of 5 stars`}>
      {"★".repeat(value)}
      {"☆".repeat(5 - value)}
    </span>
  );
}

export default function Reviews({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load(currentUserId?: string | null) {
    const { data } = await supabase
      .from("reviews")
      .select("id, user_id, rating, comment, reviewer_name, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    const list = data ?? [];
    setReviews(list);

    const mine = list.find((r) => r.user_id === currentUserId);
    if (mine) {
      setRating(mine.rating);
      setComment(mine.comment ?? "");
    }
    setLoaded(true);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      load(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const { error } = await supabase.rpc("submit_review", {
      p_product_id: productId,
      p_rating: rating,
      p_comment: comment,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage("Thanks! Your review has been saved.");
      load(userId);
    }
  }

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const hasReviewed = reviews.some((r) => r.user_id === userId);

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold">Customer reviews</h2>

      {loaded && reviews.length > 0 && (
        <p className="mt-2 text-lg">
          <Stars value={Math.round(average)} />{" "}
          <span className="text-gray-300">
            {average.toFixed(1)} out of 5 ({reviews.length}{" "}
            {reviews.length === 1 ? "review" : "reviews"})
          </span>
        </p>
      )}

      {loaded && reviews.length === 0 && (
        <p className="mt-2 text-gray-400">
          No reviews yet. Be the first to review this product.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{r.reviewer_name ?? "Customer"}</p>
              <p className="text-sm text-gray-400">
                {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
            <p className="mt-1">
              <Stars value={r.rating} />
            </p>
            {r.comment && <p className="mt-2 text-gray-300">{r.comment}</p>}
          </div>
        ))}
      </div>

      <div className="mt-8 max-w-xl">
        <h3 className="mb-3 text-xl font-semibold">
          {hasReviewed ? "Edit your review" : "Write a review"}
        </h3>

        {!userId ? (
          <p className="text-gray-300">
            <Link href="/login" className="underline">
              Log in
            </Link>{" "}
            to leave a review.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex gap-1 text-3xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  aria-label={`${n} stars`}
                  className={n <= rating ? "text-yellow-400" : "text-gray-600"}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              className="rounded border bg-transparent p-2"
              placeholder="Share your experience (optional)"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              disabled={saving}
              className="rounded bg-white p-3 font-semibold text-black"
            >
              {saving
                ? "Saving..."
                : hasReviewed
                  ? "Update review"
                  : "Submit review"}
            </button>
            {message && <p className="text-sm text-green-400">{message}</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
