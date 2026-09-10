"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { brandConfig, isValidSriLankanPhone, formatSriLankanPhone } from "@/config/brand.config";
import { supabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, AlertCircle } from "lucide-react";

export default function CustomerRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidSriLankanPhone(phone)) {
      setError("Please provide a valid Sri Lankan mobile number (e.g. 077 123 4567 or +94 77 123 4567)");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = formatSriLankanPhone(phone);
      // If customer doesn't specify an email, use standardized synthetic phone email
      const emailToUse = email.trim() || `${formattedPhone.replace("+", "")}@auth.fixora.lk`;

      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailToUse,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: formattedPhone,
            role: "customer",
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert into profiles table
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: authData.user.id,
          role: "customer",
          full_name: fullName,
          email: emailToUse,
          phone_number: formattedPhone,
          district,
          city: city.trim() || district,
          is_active: true,
        });

        if (profileError) {
          console.error("Profile creation warning:", profileError);
        }

        router.push("/customer/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            Create Customer Account
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Get your home issues fixed by verified local specialists
          </p>
        </div>

        <Card className="shadow-lg border-zinc-200/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quick Registration</CardTitle>
            <CardDescription>
              Takes less than 30 seconds. No credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Kasun Perera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="phone">Mobile Number (Sri Lanka)</Label>
                <Input
                  id="phone"
                  placeholder="07X XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="kasun@example.com (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="district">District</Label>
                  <select
                    id="district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="mt-1.5 flex h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    {brandConfig.supportedDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="city">City / Town</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Nugegoda"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
