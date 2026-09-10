import Link from "next/link";
import { brandConfig } from "@/config/brand.config";
import { Navbar } from "@/components/layout/Navbar";
import { ServiceRequestWizard } from "@/components/customer/ServiceRequestWizard";
import { ToastProvider } from "@/components/ui/toast";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import {
  ShieldCheck,
  Search,
  CheckCircle2
} from "lucide-react";



export default function Home() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950 font-sans">
        <Navbar />

        <main className="flex-1">
          {/* HERO SECTION */}
          <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-zinc-900 py-20 px-4 sm:px-6 lg:px-8 text-white">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative mx-auto max-w-5xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 mb-6 backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Professionals in {brandConfig.country}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                What do you need help with?
              </h1>

              <p className="mx-auto max-w-2xl text-base sm:text-lg text-emerald-100/80 mb-10">
                Book verified Sri Lankan plumbers, electricians, AC technicians, and cleaners.
                Receive competitive quotes from up to 3 vetted pros and pay directly upon completion.
              </p>

              {/* Localized Search Bar */}
              <div className="mx-auto max-w-2xl bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-zinc-200 text-zinc-900">
                <div className="flex-1 flex items-center gap-2.5 px-3">
                  <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search e.g. 'Plumber', 'AC gas filling'..."
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:text-zinc-400 py-2"
                  />
                </div>
                <div className="sm:border-l sm:border-zinc-200 flex items-center px-3">
                  <select className="bg-transparent text-sm text-zinc-700 focus:outline-none py-2 font-medium cursor-pointer">
                    <option value="All">All Districts</option>
                    {brandConfig.supportedDistricts.slice(0, 8).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <a
                  href="#request-wizard"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-3 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                >
                  Find Pros
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-emerald-200/90 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Manual Admin Vetting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pay Provider Directly</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Up to 3 Quotes Compared</span>
                </div>
              </div>
            </div>
          </section>

          {/* POPULAR SERVICES SECTION */}
          <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Popular Services
              </h2>
              <p className="mt-2 text-base text-zinc-500">
                Choose a service category to quickly request quotes from top-rated specialists.
              </p>
            </div>

            <ServicesGrid />
          </section>

          {/* 6-STEP CUSTOMER REQUEST WIZARD SECTION */}
          <section className="py-12 bg-zinc-100/50 dark:bg-zinc-900/50 border-y border-zinc-200/80 dark:border-zinc-800">
            <ServiceRequestWizard />
          </section>

          {/* HOW IT WORKS */}
          <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                How {brandConfig.name} Works
              </h2>
              <p className="mt-2 text-base text-zinc-500">
                Simple, reliable, and transparent home services in 4 simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl mb-4 dark:bg-emerald-950 dark:text-emerald-300">
                  1
                </div>
                <h4 className="font-bold text-lg mb-1">Post Your Request</h4>
                <p className="text-sm text-zinc-500">
                  Fill out our 6-step form with your location, schedule, and problem details.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl mb-4 dark:bg-emerald-950 dark:text-emerald-300">
                  2
                </div>
                <h4 className="font-bold text-lg mb-1">Admin Vetting & Matching</h4>
                <p className="text-sm text-zinc-500">
                  Our operations team assigns your request to up to 3 suitable, verified local specialists.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl mb-4 dark:bg-emerald-950 dark:text-emerald-300">
                  3
                </div>
                <h4 className="font-bold text-lg mb-1">Compare & Book</h4>
                <p className="text-sm text-zinc-500">
                  Review competitive quotes, provider ratings, and accept the provider that suits you best.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl mb-4 dark:bg-emerald-950 dark:text-emerald-300">
                  4
                </div>
                <h4 className="font-bold text-lg mb-1">Pay Provider Directly</h4>
                <p className="text-sm text-zinc-500">
                  Service is performed to your satisfaction. Pay cash or bank transfer directly upon completion.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-zinc-500">
            <p>
              &copy; {new Date().getFullYear()} {brandConfig.name}. Built for {brandConfig.country}.
            </p>
            <p className="text-xs text-zinc-400 mt-2">
              On-demand verified local professionals &bull; Direct-to-provider settlement &bull; Sri Lanka
            </p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}