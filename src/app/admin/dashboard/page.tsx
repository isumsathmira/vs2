import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { brandConfig } from "@/config/brand.config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  Layers,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  LogOut,
  ShieldAlert
} from "lucide-react";
import { assignProvidersToRequest, updateProviderStatus } from "@/app/actions/adminActions";
import { AdminMatchingModal } from "@/components/admin/AdminMatchingModal";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/dashboard");
  }

  // Role validation
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  // 1. Fetch Stats
  const { count: totalCustomers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer");

  const { count: totalProviders } = await supabase
    .from("providers")
    .select("*", { count: "exact", head: true });

  const { count: activeBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .in("status", ["confirmed", "on_the_way", "arrived", "working"]);

  const { count: pendingRequestsCount } = await supabase
    .from("service_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_assignment");

  // 2. Fetch pending requests needing manual matching
  const { data: pendingRequests } = await supabase
    .from("service_requests")
    .select(`
      *,
      customer:profiles!service_requests_customer_id_fkey (full_name, phone_number)
    `)
    .eq("status", "pending_assignment")
    .order("created_at", { ascending: false });

  // 3. Fetch approved active providers for matching
  const { data: approvedProviders } = await supabase
    .from("providers")
    .select(`
      id,
      business_name,
      status,
      average_rating,
      profile:profiles (full_name, phone_number, district, city)
    `)
    .eq("status", "approved");

  // 4. Fetch pending provider verification applications
  const { data: pendingApplications } = await supabase
    .from("providers")
    .select(`
      *,
      profile:profiles (full_name, phone_number, district, city)
    `)
    .eq("status", "pending");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-16">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-900 text-white dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold">
              A
            </div>
            <div>
              <span className="font-bold text-lg">{brandConfig.name} Admin Portal</span>
              <span className="text-xs text-zinc-400 block -mt-1">Manual Matching & Platform Operations</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-300 hidden sm:inline">
              Admin: {profile?.full_name}
            </span>
            <form action="/auth/signout" method="post">
              <Button variant="outline" size="sm" type="submit" className="text-zinc-200 border-zinc-700 bg-zinc-800 hover:bg-zinc-700">
                <LogOut className="w-4 h-4 mr-1.5" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase font-bold text-zinc-500">
                Pending Matching
              </CardDescription>
              <CardTitle className="text-2xl font-black text-amber-600">
                {pendingRequestsCount || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-zinc-500">
              Customer requests awaiting admin assignment
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase font-bold text-zinc-500">
                Active Bookings
              </CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-600">
                {activeBookings || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-zinc-500">
              Jobs currently being executed or confirmed
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase font-bold text-zinc-500">
                Total Customers
              </CardDescription>
              <CardTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {totalCustomers || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-zinc-500">
              Registered customers in Sri Lanka
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase font-bold text-zinc-500">
                Total Providers
              </CardDescription>
              <CardTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {totalProviders || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-zinc-500">
              {pendingApplications?.length || 0} applications pending verification
            </CardContent>
          </Card>
        </div>

        {/* CORE WORKFLOW: Manual Matching Operations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                Customer Requests Needing Manual Matching
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Admin Workflow: Review the request details, district, and select up to 3 verified local providers.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full">
              {pendingRequests?.length || 0} Pending
            </span>
          </div>

          {(!pendingRequests || pendingRequests.length === 0) ? (
            <Card className="text-center py-10 border-dashed">
              <CardContent className="text-zinc-500 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All customer requests have been assigned! Check back when new requests arrive.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req: any) => (
                <Card key={req.id} className="border-amber-200 bg-white dark:bg-zinc-900 dark:border-zinc-800">
                  <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {req.status.replace("_", " ")}
                        </span>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                          {req.title}
                        </h3>
                      </div>

                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {req.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs text-zinc-500 pt-1">
                        <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {req.city}, {req.district}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          Preferred: {req.preferred_date} ({req.preferred_time_slot})
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-zinc-400" />
                          Customer: {req.contact_name} ({req.contact_phone})
                        </span>
                        {req.estimated_budget_lkr && (
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Budget: Rs. {req.estimated_budget_lkr.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interactive Matching Action Component */}
                    <div className="shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0">
                      <AdminMatchingModal
                        requestId={req.id}
                        requestTitle={req.title}
                        requestDistrict={req.district}
                        availableProviders={approvedProviders || []}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* SECTION: Provider Applications Needing Approval */}
        {pendingApplications && pendingApplications.length > 0 && (
          <section className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-600" />
              Provider Applications Awaiting NIC Verification
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingApplications.map((prov: any) => (
                <Card key={prov.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{prov.business_name || prov.profile?.full_name}</CardTitle>
                    <CardDescription>
                      NIC: <strong className="text-zinc-800 dark:text-zinc-200">{prov.id_card_number}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <div>Applicant: {prov.profile?.full_name}</div>
                    <div>Phone: {prov.profile?.phone_number}</div>
                    <div>District: {prov.profile?.district}</div>
                    <div>Experience: {prov.experience_years} years</div>
                    {prov.bio && <p className="italic bg-zinc-50 p-2 rounded dark:bg-zinc-800/40">"{prov.bio}"</p>}

                    <div className="flex gap-2 pt-2">
                      <form action={async () => {
                        "use server";
                        await updateProviderStatus(prov.id, "approved");
                      }} className="flex-1">
                        <Button type="submit" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Approve Provider
                        </Button>
                      </form>
                      <form action={async () => {
                        "use server";
                        await updateProviderStatus(prov.id, "rejected");
                      }}>
                        <Button type="submit" size="sm" variant="destructive">
                          Reject
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
