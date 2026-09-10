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
  AlertCircle,
  FileText,
  PlusCircle,
  User,
  LogOut,
  ChevronRight
} from "lucide-react";
import { CustomerReviewModal } from "@/components/customer/CustomerReviewModal";
import { ReportProblemModal } from "@/components/customer/ReportProblemModal";

export default async function CustomerDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/customer/dashboard");
  }

  // Fetch customer profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch customer requests with quotes count
  const { data: requests } = await supabase
    .from("service_requests")
    .select(`
      *,
      provider_quotes (id, status, quoted_price_lkr)
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch active bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      provider:providers (
        id,
        business_name,
        average_rating
      )
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const activeRequests = requests || [];
  const activeBookings = bookings || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-zinc-900 dark:text-white">
              {brandConfig.name}
            </span>
          </Link>

          {/* Navigation Items: Home, My Requests, Bookings, Messages, Profile */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            <Link href="/" className="hover:text-emerald-600">Home</Link>
            <Link href="/customer/dashboard" className="text-emerald-600 font-semibold">My Requests</Link>
            <Link href="#bookings" className="hover:text-emerald-600">Bookings</Link>
            <Link href="#messages" className="hover:text-emerald-600">Messages</Link>
            <Link href="#profile" className="hover:text-emerald-600">Profile</Link>
          </nav>

          <div className="flex items-center gap-3">
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit" className="text-zinc-500 hover:text-red-600 gap-1.5">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
            <Link href="/#request-wizard">
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                <PlusCircle className="w-4 h-4" />
                New Request
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome, {profile?.full_name || "Customer"}!
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Location: {profile?.city || profile?.district || "Sri Lanka"} &bull; {profile?.phone_number || user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Account
            </div>
          </div>
        </div>

        {/* Section: Active Bookings */}
        {activeBookings.length > 0 && (
          <section id="bookings" className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Active Bookings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBookings.map((booking: any) => (
                <Card key={booking.id} className="border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/40">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">
                          {booking.provider?.business_name || "Assigned Provider"}
                        </CardTitle>
                        <CardDescription>
                          Scheduled for {new Date(booking.scheduled_for).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Agreed Price:</span>
                      <span className="font-bold text-emerald-700">{formatLKR(booking.agreed_price_lkr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Payment:</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">Pay Directly upon completion</span>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between">
                      {booking.status === "completed" ? (
                        <CustomerReviewModal
                          bookingId={booking.id}
                          providerName={booking.provider?.business_name || "Provider"}
                        />
                      ) : (
                        <span className="text-xs text-zinc-500">
                          Status: <strong className="text-zinc-800 dark:text-zinc-200">{booking.status.replace("_", " ")}</strong>
                        </span>
                      )}

                      <ReportProblemModal
                        bookingId={booking.id}
                        reportedUserId={booking.provider_id}
                        targetName={booking.provider?.business_name}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section: My Requests */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              My Service Requests
            </h2>
            <span className="text-xs text-zinc-500">
              {activeRequests.length} Total Requests
            </span>
          </div>

          {activeRequests.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
              <CardContent className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">No active service requests</h3>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                  Have a leak, wiring problem, or need cleaning? Post your first request and get up to 3 competitive quotes.
                </p>
                <div className="pt-2">
                  <Link href="/#request-wizard">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Request a Professional
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRequests.map((req: any) => {
                const quoteCount = req.provider_quotes?.length || 0;
                return (
                  <Card key={req.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base font-bold line-clamp-1">
                          {req.title}
                        </CardTitle>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          req.status === "pending_assignment"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : req.status === "assigned"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : req.status === "quotes_received"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800"
                        }`}>
                          {req.status === "pending_assignment" ? "Admin Reviewing" : req.status.replace("_", " ")}
                        </span>
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {req.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{req.city}, {req.district}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{req.preferred_date} ({req.preferred_time_slot})</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <span className="font-medium text-emerald-700 dark:text-emerald-400 font-sans">
                          {quoteCount > 0 ? `🎉 ${quoteCount} quotes received` : "Matching with up to 3 pros"}
                        </span>
                        {req.estimated_budget_lkr && (
                          <span className="text-zinc-500">
                            Budget: {formatLKR(req.estimated_budget_lkr)}
                          </span>
                        )}
                      </div>
                    </CardContent>

                    <div className="p-4 pt-0">
                      <Link href={`/customer/requests/${req.id}`}>
                        <Button variant="outline" size="sm" className="w-full justify-between">
                          <span>View Quotes & Details</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
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
