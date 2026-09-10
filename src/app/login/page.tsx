"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { brandConfig, isValidSriLankanPhone, formatSriLankanPhone } from "@/config/brand.config";
import { supabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [identifier, setIdentifier] = useState(""); // Email or Phone
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let emailToUse = identifier.trim();

      // If user typed a phone number, convert to synthetic email identifier if needed
      if (isValidSriLankanPhone(identifier)) {
        const formatted = formatSriLankanPhone(identifier).replace("+", "");
        emailToUse = `${formatted}@auth.fixora.lk`;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        // Fetch user profile role to route appropriately
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "admin") {
          router.push("/admin/dashboard");
        } else if (profile?.role === "provider") {
          router.push("/provider/dashboard");
        } else {
          router.push(redirect !== "/" ? redirect : "/customer/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-zinc-200/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Sign In</CardTitle>
        <CardDescription>
          Enter your email or Sri Lankan mobile number
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="identifier">Email or Mobile Number</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="name@example.com or 07X XXX XXXX"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500 space-y-2">
          <p>
            Don&apos;t have a customer account?{" "}
            <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
              Register as Customer
            </Link>
          </p>
          <p>
            Are you a skilled technician?{" "}
            <Link href="/provider/register" className="text-emerald-600 font-semibold hover:underline">
              Register as Service Provider
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {brandConfig.name}
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Sign in to manage your requests and bookings
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-400">Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
