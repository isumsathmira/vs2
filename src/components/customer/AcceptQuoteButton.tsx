"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptQuoteAndConfirmBooking } from "@/app/actions/bookingActions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatLKR } from "@/config/brand.config";
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface AcceptQuoteButtonProps {
  quoteId: string;
  quotedPrice: number;
  providerName: string;
}

export function AcceptQuoteButton({
  quoteId,
  quotedPrice,
  providerName,
}: AcceptQuoteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await acceptQuoteAndConfirmBooking(quoteId);
      if (!res.success) {
        toast(res.error || "Failed to confirm booking.", "error");
        return;
      }

      toast(`Booking confirmed with ${providerName}! Pay directly upon completion.`, "success");
      router.refresh();
      router.push("/customer/dashboard");
    } catch {
      toast("An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
      >
        Book This Provider
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                  Confirm Your Booking
                </h3>
                <p className="text-xs text-zinc-500">
                  Direct provider payment &bull; No online card fees
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4 border text-sm space-y-2 dark:bg-zinc-800/40 dark:border-zinc-700">
              <div className="flex justify-between">
                <span className="text-zinc-500">Provider:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{providerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Agreed Price:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {formatLKR(quotedPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Settlement:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  Pay directly to provider upon completion
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                onClick={handleConfirm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? "Confirming..." : "Confirm & Hire"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
