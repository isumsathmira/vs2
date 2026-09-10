"use client";

import { useState } from "react";
import { assignProvidersToRequest } from "@/app/actions/adminActions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { UserCheck, Check, X, ShieldCheck, MapPin } from "lucide-react";

interface AdminMatchingModalProps {
  requestId: string;
  requestTitle: string;
  requestDistrict: string;
  availableProviders: any[];
}

export function AdminMatchingModal({
  requestId,
  requestTitle,
  requestDistrict,
  availableProviders,
}: AdminMatchingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const toggleSelect = (id: string) => {
    if (selectedProviderIds.includes(id)) {
      setSelectedProviderIds((prev) => prev.filter((p) => p !== id));
    } else {
      if (selectedProviderIds.length >= 3) {
        toast("MVP Constraint: You can select a maximum of 3 providers.", "info");
        return;
      }
      setSelectedProviderIds((prev) => [...prev, id]);
    }
  };

  const handleAssign = async () => {
    if (selectedProviderIds.length === 0) {
      toast("Please select at least 1 provider.", "error");
      return;
    }
    setSubmitting(true);

    try {
      const res = await assignProvidersToRequest(requestId, selectedProviderIds);
      if (!res.success) {
        toast(res.error || "Failed to assign providers.", "error");
        return;
      }

      toast(`Successfully assigned ${selectedProviderIds.length} provider(s) to this request!`, "success");
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
        onClick={() => setIsOpen(true)}
        className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-medium"
      >
        <UserCheck className="w-4 h-4" />
        Manually Assign Providers
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                  Manual Provider Matching
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Request: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{requestTitle}</span> ({requestDistrict})
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction banner */}
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3 border-b border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex justify-between items-center">
              <span>
                Select up to <strong>3 suitable local providers</strong>. They will be alerted to submit competitive quotes.
              </span>
              <span className="font-bold bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded text-[11px]">
                {selectedProviderIds.length} / 3 Selected
              </span>
            </div>

            {/* Providers Selection List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {availableProviders.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500">
                  No approved providers found. Approve pending providers below first.
                </div>
              ) : (
                availableProviders.map((prov) => {
                  const isSelected = selectedProviderIds.includes(prov.id);
                  const isDistrictMatch = prov.profile?.district === requestDistrict;

                  return (
                    <div
                      key={prov.id}
                      onClick={() => toggleSelect(prov.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30"
                          : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {prov.business_name || prov.profile?.full_name}
                          </span>
                          {isDistrictMatch && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              District Match
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-400" />
                            {prov.profile?.district || "Sri Lanka"}
                          </span>
                          <span>Rating: ⭐ {prov.average_rating || "New"}</span>
                          <span>Phone: {prov.profile?.phone_number}</span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-zinc-300 dark:border-zinc-700"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={submitting || selectedProviderIds.length === 0}
                onClick={handleAssign}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? "Assigning..." : `Confirm & Assign (${selectedProviderIds.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
