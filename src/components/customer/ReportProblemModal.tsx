"use client";

import { useState } from "react";
import { submitTrustSafetyReport } from "@/app/actions/safetyActions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ShieldAlert, X } from "lucide-react";

interface ReportProblemModalProps {
  bookingId?: string;
  reportedUserId?: string;
  targetName?: string;
}

const REPORT_REASONS = [
  "Provider didn't arrive",
  "Price dispute",
  "Poor service",
  "Inappropriate behavior",
  "Fraud/scam",
  "Other",
] as const;

export function ReportProblemModal({
  bookingId,
  reportedUserId,
  targetName,
}: ReportProblemModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<typeof REPORT_REASONS[number]>("Provider didn't arrive");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast("Please provide details regarding the issue.", "error");
      return;
    }
    setSubmitting(true);

    try {
      const res = await submitTrustSafetyReport({
        bookingId,
        reportedUserId,
        reason,
        description,
      });

      if (!res.success) {
        toast(res.error || "Failed to submit report.", "error");
        return;
      }

      toast("Your report has been received by Fixora Support. We will investigate immediately.", "success");
      setIsOpen(false);
      setDescription("");
    } catch {
      toast("An unexpected error occurred.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[11px] text-zinc-400 hover:text-red-600 underline flex items-center gap-1 cursor-pointer transition-colors"
      >
        <ShieldAlert className="w-3 h-3 text-red-500" />
        Report a problem
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center dark:bg-red-950 dark:text-red-300">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                    Report an Issue
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Trust & Safety team escalation {targetName ? `(${targetName})` : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for Report *</Label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="mt-1.5 flex h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="desc">What happened? *</Label>
                <textarea
                  id="desc"
                  rows={4}
                  placeholder="Provide specific details, dates, or communication context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="mt-1.5 flex w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
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
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
