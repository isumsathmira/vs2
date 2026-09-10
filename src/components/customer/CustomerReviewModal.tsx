"use client";

import { useState } from "react";
import { submitProviderReview } from "@/app/actions/bookingActions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Star, CheckCircle, X } from "lucide-react";

interface CustomerReviewModalProps {
  bookingId: string;
  providerName: string;
  hasExistingReview?: boolean;
}

export function CustomerReviewModal({
  bookingId,
  providerName,
  hasExistingReview = false,
}: CustomerReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(hasExistingReview);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await submitProviderReview(bookingId, rating, comment);
      if (!res.success) {
        toast(res.error || "Failed to submit review.", "error");
        return;
      }

      toast("Thank you! Your review has been published.", "success");
      setReviewed(true);
      setIsOpen(false);
    } catch {
      toast("An unexpected error occurred.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (reviewed) {
    return (
      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
        <CheckCircle className="w-3.5 h-3.5" />
        Review Submitted
      </span>
    );
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5 text-xs font-semibold"
      >
        <Star className="w-3.5 h-3.5 fill-current" />
        Rate Experience
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                  How was your experience?
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Share feedback for <strong>{providerName}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1-5 Star Interactive Rating */}
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          (hoverRating || rating) >= star
                            ? "text-amber-400 fill-amber-400"
                            : "text-zinc-300 dark:text-zinc-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {rating === 5 && "Excellent (5/5)"}
                  {rating === 4 && "Very Good (4/5)"}
                  {rating === 3 && "Average (3/5)"}
                  {rating === 2 && "Below Expectations (2/5)"}
                  {rating === 1 && "Poor (1/5)"}
                </span>
              </div>

              <div>
                <Label htmlFor="comment">Optional Comments</Label>
                <textarea
                  id="comment"
                  rows={3}
                  placeholder="Was the work done cleanly? Was the provider punctual and polite?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-1.5 flex w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {submitting ? "Publishing..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
