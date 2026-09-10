"use client";

import Link from "next/link";
import { useState } from "react";
import { brandConfig } from "@/config/brand.config";
import { Button } from "@/components/ui/button";
import { Wrench, Menu, X, ShieldCheck, User } from "lucide-react";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-102">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {brandConfig.name}
            </span>
            <span className="text-[10px] font-medium tracking-wide text-emerald-600 -mt-1 uppercase">
              {brandConfig.country}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <Link href="#services" className="transition hover:text-emerald-600 dark:hover:text-emerald-400">
            Services
          </Link>
          <Link href="#how-it-works" className="transition hover:text-emerald-600 dark:hover:text-emerald-400">
            How It Works
          </Link>
          <Link href="#districts" className="transition hover:text-emerald-600 dark:hover:text-emerald-400">
            Coverage
          </Link>
          <Link href="/provider/register" className="flex items-center gap-1.5 text-zinc-800 font-semibold hover:text-emerald-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Become a Provider
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <NotificationDrawer />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link href="#request-wizard">
            <Button size="sm" className="shadow-sm">
              Request Service
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-white px-4 pt-2 pb-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-4 text-base font-medium text-zinc-800 dark:text-zinc-200">
            <Link
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600"
            >
              Services
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-600"
            >
              How It Works
            </Link>
            <Link
              href="/provider/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-1 text-emerald-600 font-semibold"
            >
              <ShieldCheck className="h-4 w-4" />
              Become a Provider
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="#request-wizard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">
                  Request Service
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
