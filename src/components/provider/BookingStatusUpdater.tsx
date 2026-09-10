"use client";

import { useState } from "react";
import { updateBookingJobStatus } from "@/app/actions/providerActions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface BookingStatusUpdaterProps {
  bookingId: string;
  currentStatus: string;
}

const SEQUENTIAL_STEPS: Array<{
  status: "confirmed" | "on_the_way" | "arrived" | "working" | "completed";
  label: string;
  nextStatus?: "on_the_way" | "arrived" | "working" | "completed";
  nextLabel?: string;
}> = [
  { status: "confirmed", label: "Confirmed", nextStatus: "on_the_way", nextLabel: "Mark 'On the Way'" },
  { status: "on_the_way", label: "On the Way", nextStatus: "arrived", nextLabel: "Mark 'Arrived'" },
  { status: "arrived", label: "Arrived", nextStatus: "working", nextLabel: "Mark 'Started Working'" },
  { status: "working", label: "Working", nextStatus: "completed", nextLabel: "Mark 'Job Completed'" },
  { status: "completed", label: "Completed" },
];

export function BookingStatusUpdater({ bookingId, currentStatus }: BookingStatusUpdaterProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const currentStep = SEQUENTIAL_STEPS.find((s) => s.status === currentStatus);

  if (!currentStep || !currentStep.nextStatus) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        Job Fully Completed & Direct Payment Recorded
      </div>
    );
  }

  const handleAdvance = async () => {
    if (!currentStep.nextStatus) return;
    setLoading(true);

    try {
      const res = await updateBookingJobStatus(bookingId, currentStep.nextStatus);
      if (!res.success) {
        toast(res.error || "Failed to update status.", "error");
        return;
      }
      toast(`Status updated to "${currentStep.nextStatus.replace("_", " ")}"`, "success");
    } catch {
      toast("An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-zinc-500">
        Current step: <strong className="text-zinc-800 dark:text-zinc-200">{currentStep.label}</strong>
      </span>
      <Button
        size="sm"
        disabled={loading}
        onClick={handleAdvance}
        className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
      >
        {loading ? "Updating..." : currentStep.nextLabel}
        <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </Button>
    </div>
  );
}
