"use client";

import { useState } from "react";
import { submitProviderQuote } from "@/app/actions/providerActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Send, X, DollarSign } from "lucide-react";

interface ProviderQuoteModalProps {
  requestId: string;
  requestTitle: string;
  existingQuote?: any;
}

export function ProviderQuoteModal({
  requestId,
  requestTitle,
  existingQuote,
}: ProviderQuoteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [price, setPrice] = useState(existingQuote?.quoted_price_lkr || "");
  const [duration, setDuration] = useState(existingQuote?.estimated_duration_hours || "2");
  const [date, setDate] = useState(existingQuote?.proposed_date || new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState(existingQuote?.proposed_time_slot || "Morning (8AM - 12PM)");
  const [notes, setNotes] = useState(existingQuote?.provider_notes || "");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || parseFloat(price) <= 0) {
      toast("Please enter a valid price quote in LKR.", "error");
      return;
    }
    setSubmitting(true);

    try {
      const res = await submitProviderQuote({
        requestId,
        quotedPriceLkr: parseFloat(price),
        estimatedDurationHours: parseFloat(duration) || 2,
        proposedDate: date,
        proposedTimeSlot: timeSlot,
        providerNotes: notes,
      });

      if (!res.success) {
        toast(res.error || "Failed to submit quote.", "error");
        return;
      }

      toast("Your competitive quote has been submitted to the customer!", "success");
      setIsOpen(false);
    } catch {
      toast("An unexpected error occurred.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant={existingQuote ? "outline" : "default"}
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full gap-1.5"
      >
        <Send className="w-3.5 h-3.5" />
        {existingQuote ? "Update My Quote" : "Submit Quote"}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                  {existingQuote ? "Update Quote" : "Submit Quote"}
                </h3>
                <p className="text-xs text-zinc-500 line-clamp-1">{requestTitle}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <Label htmlFor="price">Your Quote Price (LKR / Rs.) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g. 3500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="mt-1.5"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Fair pricing increases your chance of winning this customer's booking.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date">Proposed Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Est. Duration (Hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    step="0.5"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="slot">Proposed Time Slot</Label>
                <select
                  id="slot"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="mt-1.5 flex h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
                  <option value="Evening (4:00 PM - 8:00 PM)">Evening (4:00 PM - 8:00 PM)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="notes">Notes for Customer (Optional)</Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="e.g. Includes materials inspection; 1-month workmanship warranty included..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5 flex w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                  {submitting ? "Submitting..." : "Send Quote"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
