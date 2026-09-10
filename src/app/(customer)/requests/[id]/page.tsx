import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { brandConfig, formatLKR } from "@/config/brand.config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  User,
  Star
} from "lucide-react";
import { AcceptQuoteButton } from "@/components/customer/AcceptQuoteButton";

interface CustomerRequestPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerRequestPage({ params }: CustomerRequestPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/customer/requests/${id}`);
  }

  // 1. Fetch request details
  const { data: request } = await supabase
    .from("service_requests")
    .select(`
      *,
      quotes:provider_quotes (
        id,
        quoted_price_lkr,
        estimated_duration_hours,
        proposed_date,
        proposed_time_slot,
        provider_notes,
        status,
        provider:providers (
          id,
          business_name,
          average_rating,
          total_reviews,
          completed_jobs_count,
          experience_years,
          profile:profiles (full_name, district, city)
        )
      )
    `)
    .eq("id", id)
    .single();

  if (!request || request.customer_id !== user.id) {
    notFound();
  }

  const quotes = request.quotes || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-16">
      <header className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/customer/dashboard" className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {request.status.replace("_", " ")}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Request Overview Card */}
        <Card className="border-zinc-200/80 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{request.title}</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  Submitted on {new Date(request.created_at).toLocaleDateString()} &bull; Direct-to-provider settlement
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
            <p className="leading-relaxed whitespace-pre-wrap">{request.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{request.address}, {request.city}, {request.district}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Preferred: {request.preferred_date} ({request.preferred_time_slot})</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Budget: {request.estimated_budget_lkr ? formatLKR(request.estimated_budget_lkr) : "Not specified"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotes Comparison Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Quotes Received ({quotes.length} / 3)
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Compare prices, provider ratings, and accept the provider you want to hire.
              </p>
            </div>
          </div>

          {quotes.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
              <CardContent className="space-y-2">
                <Clock className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="font-bold text-base">Waiting for Quotes</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">
                  Our administrators have alerted verified local specialists in {request.district}. Quotes will appear here as soon as providers submit them.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quotes.map((quote: any) => {
                const prov = quote.provider;
                const isAccepted = quote.status === "accepted";
                const isRejected = quote.status === "rejected";

                return (
                  <Card
                    key={quote.id}
                    className={`flex flex-col justify-between transition-all ${
                      isAccepted
                        ? "border-2 border-emerald-600 bg-emerald-50/20 shadow-md"
                        : "border-zinc-200 hover:shadow-md"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                          ⭐ {prov?.average_rating > 0 ? prov.average_rating : "New Pro"}
                        </span>
                        {isAccepted && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Booked
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold line-clamp-1">
                        {prov?.business_name || prov?.profile?.full_name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {prov?.profile?.district} &bull; {prov?.experience_years || 1} yrs exp &bull; {prov?.completed_jobs_count || 0} jobs done
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 text-xs flex-1">
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900">
                        <span className="text-zinc-500 text-[11px] block">Quoted Price:</span>
                        <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                          {formatLKR(quote.quoted_price_lkr)}
                        </span>
                      </div>

                      <div className="space-y-1 text-zinc-600 dark:text-zinc-400">
                        <div>Duration: <strong>~{quote.estimated_duration_hours} hours</strong></div>
                        <div>Proposed: <strong>{quote.proposed_date}</strong></div>
                        <div>Slot: <strong>{quote.proposed_time_slot}</strong></div>
                      </div>

                      {quote.provider_notes && (
                        <p className="italic bg-zinc-50 p-2.5 rounded-lg border text-zinc-600 dark:bg-zinc-800/40 dark:border-zinc-700">
                          "{quote.provider_notes}"
                        </p>
                      )}
                    </CardContent>

                    <div className="p-4 pt-0">
                      {isAccepted ? (
                        <div className="text-center py-2 text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Booking Confirmed
                        </div>
                      ) : isRejected ? (
                        <div className="text-center py-2 text-xs text-zinc-400">
                          Other quote chosen
                        </div>
                      ) : (
                        <AcceptQuoteButton
                          quoteId={quote.id}
                          quotedPrice={quote.quoted_price_lkr}
                          providerName={prov?.business_name || prov?.profile?.full_name}
                        />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
