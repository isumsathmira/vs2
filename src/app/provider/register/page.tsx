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
import { ShieldCheck, AlertCircle } from "lucide-react";

export default function ProviderRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [district, setDistrict] = useState("Kurunegala");
  const [experienceYears, setExperienceYears] = useState("3");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidSriLankanPhone(phone)) {
      setError("Please provide a valid Sri Lankan mobile number (e.g. 07X XXX XXXX)");
      return;
    }

    if (!nicNumber.trim()) {
      setError("National Identity Card (NIC) number is required for provider verification");
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = formatSriLankanPhone(phone);
      const emailToUse = email.trim() || `${formattedPhone.replace("+", "")}@auth.fixora.lk`;

      // 1. Auth Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailToUse,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: formattedPhone,
            role: "provider",
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert into profiles
        await supabase.from("profiles").upsert({
          id: authData.user.id,
          role: "provider",
          full_name: fullName,
          email: emailToUse,
          phone_number: formattedPhone,
          district,
          city: district,
          is_active: true,
        });

        // 3. Insert into providers
        await supabase.from("providers").upsert({
          id: authData.user.id,
          business_name: businessName.trim() || fullName,
          id_card_number: nicNumber.trim(),
          bio,
          experience_years: parseInt(experienceYears, 10) || 1,
          status: "pending", // Requires Admin vetting/approval
        });

        // 4. Default service area
        await supabase.from("service_areas").upsert({
          provider_id: authData.user.id,
          district,
        });

        router.push("/provider/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to register as provider.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {brandConfig.name} Pro Network
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Join as a Service Provider
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Receive matched customer requests in your area and grow your earnings
          </p>
        </div>

        <Card className="shadow-lg border-zinc-200/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Provider Application</CardTitle>
            <CardDescription>
              Admin verified &bull; Direct customer payment &bull; Zero commission for early partners
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="e.g. Sunil Shantha"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name (Optional)</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g. Shantha Electricals"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone">Mobile (Sri Lanka)</Label>
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
                  <Label htmlFor="nic">NIC Number (National ID)</Label>
                  <Input
                    id="nic"
                    placeholder="e.g. 198512345678 or 851234567V"
                    value={nicNumber}
                    onChange={(e) => setNicNumber(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="district">Primary Service District</Label>
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
                  <Label htmlFor="exp">Years of Experience</Label>
                  <Input
                    id="exp"
                    type="number"
                    min="0"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="provider@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="bio">Brief Profile & Expertise</Label>
                <textarea
                  id="bio"
                  rows={2}
                  placeholder="Describe your qualifications, skills, and types of repairs you handle..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1.5 flex w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
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
                {loading ? "Submitting Application..." : "Submit Provider Application"}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-zinc-500">
              Already registered as a provider?{" "}
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
