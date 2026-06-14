"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function ReviewForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setErr("Please select a rating."); return; }
    setLoading(true); setErr(null);
    const res = await fetch(`/api/jobs/${jobId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error || "Failed"); return; }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3 border-t border-white/10 pt-4">
      <h3 className="font-bold text-white">Rate the Welder</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-transform hover:scale-110"
          >
            <Star
              size={28}
              className={(hover || rating) >= s ? "fill-amber-400 text-amber-400" : "text-white/20"}
            />
          </button>
        ))}
      </div>
      <textarea
        className="input min-h-20"
        placeholder="Share your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {err && <p className="text-sm text-red-400">{err}</p>}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
