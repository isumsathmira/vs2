"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { brandConfig } from "@/config/brand.config";
import {
  Wrench,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock
} from "lucide-react";

export function ServiceRequestWizard() {
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("Plumbing");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState(brandConfig.supportedDistricts[0]);
  const [date, setDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
        Loading service wizard...
      </div>
    );
  }

  const handleNext = () => {
    if (step === 2 && !description.trim()) {
      toast("Please enter a short description of your problem.", "error");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Service request posted successfully! Vetted pros have been notified.", "success");
    setStep(1);
    setDescription("");
  };

  return (
    <div id="request-wizard" className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-10 shadow-xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Select Service Category</h3>
                <p className="text-sm text-zinc-500 mt-1">What kind of professional assistance do you need?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["Plumbing", "Electrical Work", "AC Servicing", "House Cleaning", "Carpentry", "General Maintenance"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${category === item
                      ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-500 shadow-sm"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-300"
                      }`}
                  >
                    <Wrench className="w-5 h-5 mb-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-sm">{item}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={handleNext} className="gap-2">
                  Next Step <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: PROBLEM DESCRIPTION */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Describe the Issue</h3>
                <p className="text-sm text-zinc-500 mt-1">Provide brief details so pros can quote accurately.</p>
              </div>

              <div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Kitchen tap is leaking heavily from the base joint..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:text-white"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrev} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button type="button" onClick={handleNext} className="gap-2">
                  Next Step <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION & SCHEDULE */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Location & Schedule</h3>
                <p className="text-sm text-zinc-500 mt-1">Where and when should the professional arrive?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-2">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:text-white cursor-pointer"
                  >
                    {brandConfig.supportedDistricts.map((d) => (
                      <option key={d} value={d} className="dark:bg-zinc-900">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrev} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button type="button" onClick={handleNext} className="gap-2">
                  Review Request <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Review Your Request</h3>
                <p className="text-sm text-zinc-500 mt-1">Check details before posting to verified local pros.</p>
              </div>

              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-5 space-y-3 text-sm border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700/50 pb-2">
                  <span className="text-zinc-500">Category:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{category}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700/50 pb-2">
                  <span className="text-zinc-500">District:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{district}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700/50 pb-2">
                  <span className="text-zinc-500">Preferred Date:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{date || "As soon as possible"}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-1">Description:</span>
                  <p className="text-zinc-800 dark:text-zinc-200 italic bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    "{description || "No description provided."}"
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrev} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Submit Request
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ServiceRequestWizard;