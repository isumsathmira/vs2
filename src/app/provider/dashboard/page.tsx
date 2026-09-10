import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { brandConfig, formatLKR } from "@/config/brand.config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  DollarSign,
  Send,
  LogOut,
  AlertCircle
} from "lucide-react";
import { ProviderQuoteModal } from "@/components/provider/ProviderQuoteModal";
import { BookingStatusUpdater } from "@/components/provider/BookingStatusUpdater";

export default async function ProviderDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/provider/dashboard");
  }

  // 1. Fetch provider details
  const { data: provider } = await supabase
    .from("providers")
    .select(`
      *,
      profile:profiles (*)
    `)
    .eq("id", user.id)
    .single();

  if (!provider) {
    redirect("/provider/register");
  }

  // 2. Fetch assigned requests (requests where admin matched this provider)
  const { data: assignedRequests } = await supabase
    .from("request_assignments")
    .select(`
      assigned_at,
      request:service_requests (
        id,
        title,
        description,
        district,
        city,
        preferred_date,
        preferred_time_slot,
        estimated_budget_lkr,
        urgency_notes,
        status,
        provider_quotes (
          id,
          provider_id,
          quoted_price_lkr,
          status
        )
      )
    `)
    .eq("provider_id", user.id)
    .order("assigned_at", { ascending: false });

  // 3. Fetch active bookings won by this provider
  const { data: activeBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      customer:profiles!bookings_customer_id_fkey (full_name, phone_number, address_line, city, district)
    `)
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-16">
      {/* Provider Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-zinc-900 dark:text-white">
                {brandConfig.name} Pro
              </span>
            </Link>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              provider.status === "approved"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }`}>
              Status: {provider.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-600 dark:text-zinc-300 hidden sm:inline font-medium">
              {provider.business_name || provider.profile?.full_name}
            </span>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit" className="text-zinc-500 hover:text-red-600">
                <LogOut className="w-4 h-4 mr-1.5" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Verification Warning if pending */}
        {provider.status === "pending" && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Application Under Review</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Our admin team is verifying your National Identity Card (NIC). Once verified, you will begin receiving job match assignments from customers in {provider.profile?.district || "your district"}.
              </p>
            </div>
          </div>
        )}

        {/* Pro Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="p-4 pb-1">
              <CardDescription className="text-xs">Assigned Jobs</CardDescription>
              <CardTitle className="text-2xl font-bold">{assignedRequests?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-1">
              <CardDescription className="text-xs">Active Bookings</CardDescription>
              <CardTitle className="text-2xl font-bold text-emerald-600">
                {activeBookings?.filter((b: any) => b.status !== "completed" && b.status !== "cancelled").length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-1">
              <CardDescription className="text-xs">Completed Jobs</CardDescription>
              <CardTitle className="text-2xl font-bold">{provider.completed_jobs_count || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-1">
              <CardDescription className="text-xs">Rating</CardDescription>
              <CardTitle className="text-2xl font-bold text-amber-500">
                ⭐ {provider.average_rating > 0 ? provider.average_rating : "New"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Active Bookings (Jobs won) */}
        {activeBookings && activeBookings.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Active Customer Bookings (Sequential Workflow)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBookings.map((booking: any) => (
                <Card key={booking.id} className="border-emerald-200 bg-white dark:bg-zinc-900">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base font-bold">
                          Customer: {booking.customer?.full_name}
                        </CardTitle>
                        <CardDescription>
                          Phone: <a href={`tel:${booking.customer?.phone_number}`} className="text-emerald-600 underline font-medium">{booking.customer?.phone_number}</a>
                        </CardDescription>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Agreed Price:</span>
                      <span className="font-bold text-emerald-700 text-sm">{formatLKR(booking.agreed_price_lkr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Scheduled:</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {new Date(booking.scheduled_for).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Location:</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {booking.customer?.city}, {booking.customer?.district}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-zinc-50 border text-zinc-600 dark:bg-zinc-800/50 dark:border-zinc-700">
                      Payment Rule: Customer will pay you directly (Cash/Bank) upon completion.
                    </div>

                    {/* Interactive sequential status update */}
                    <div className="pt-2 border-t">
                      <BookingStatusUpdater
                        bookingId={booking.id}
                        currentStatus={booking.status}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Assigned Requests for Quoting */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              Requests Assigned by Admin
            </h2>
            <span className="text-xs text-zinc-500">
              {assignedRequests?.length || 0} Total Matches
            </span>
          </div>

          {(!assignedRequests || assignedRequests.length === 0) ? (
            <Card className="text-center py-10 border-dashed">
              <CardContent className="text-zinc-500 text-sm">
                No job matches currently assigned. Once the Admin selects your profile for a request in {provider.profile?.district || "your area"}, it will appear here.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedRequests.map(({ request }: any) => {
                if (!request) return null;
                const existingQuote = request.provider_quotes?.find(
                  (q: any) => q.provider_id === user.id
                );

                return (
                  <Card key={request.id} className="flex flex-col justify-between">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-bold line-clamp-1">
                          {request.title}
                        </CardTitle>
                        {existingQuote ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Quote Sent: Rs. {existingQuote.quoted_price_lkr}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Awaiting Your Quote
                          </span>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 text-xs">
                        {request.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{request.city}, {request.district}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>Preferred: {request.preferred_date}</span>
                      </div>
                      {request.estimated_budget_lkr && (
                        <div>
                          Budget: <strong className="text-zinc-800 dark:text-zinc-200">Rs. {request.estimated_budget_lkr.toLocaleString()}</strong>
                        </div>
                      )}
                    </CardContent>

                    <div className="p-4 pt-0">
                      <ProviderQuoteModal
                        requestId={request.id}
                        requestTitle={request.title}
                        existingQuote={existingQuote}
                      />
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
