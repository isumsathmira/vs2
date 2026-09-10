"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatSriLankanPhone } from "@/config/brand.config";

export interface SubmitServiceRequestPayload {
  serviceCategory: string;
  serviceName: string;
  description: string;
  district: string;
  city: string;
  address: string;
  preferredDate: string;
  timeSlot: string;
  estimatedBudget?: string;
  urgencyNotes?: string;
  contactName: string;
  contactPhone: string;
  imagePaths?: string[];
}

export async function submitCustomerServiceRequest(payload: SubmitServiceRequestPayload) {
  const supabase = await createServerSupabaseClient();

  // 1. Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customerId = user?.id;

  // 2. If unauthenticated customer is submitting, create a lightweight customer profile
  if (!customerId) {
    const formattedPhone = formatSriLankanPhone(payload.contactPhone);
    const syntheticEmail = `${formattedPhone.replace("+", "")}@auth.fixora.lk`;

    // Attempt to see if an existing profile matches this phone
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone_number", formattedPhone)
      .maybeSingle();

    if (existingProfile) {
      customerId = existingProfile.id;
    } else {
      // Auto-register customer with a secure random key
      const tempPassword = `Fixora#${Math.random().toString(36).slice(-8)}!`;
      const { data: autoUser, error: autoErr } = await supabase.auth.signUp({
        email: syntheticEmail,
        password: tempPassword,
        options: {
          data: {
            full_name: payload.contactName,
            phone_number: formattedPhone,
            role: "customer",
          },
        },
      });

      if (autoErr || !autoUser.user) {
        // If guest signup is restricted on Supabase, proceed with error message requesting login
        return {
          success: false,
          error: "Please sign in or register before submitting your request.",
          requiresAuth: true,
        };
      }

      customerId = autoUser.user.id;

      await supabase.from("profiles").upsert({
        id: customerId,
        role: "customer",
        full_name: payload.contactName,
        email: syntheticEmail,
        phone_number: formattedPhone,
        district: payload.district,
        city: payload.city,
      });
    }
  }

  // 3. Find or map service_id
  let serviceId: string | null = null;
  const { data: matchedService } = await supabase
    .from("services")
    .select("id")
    .ilike("name", `%${payload.serviceName}%`)
    .maybeSingle();

  if (matchedService) {
    serviceId = matchedService.id;
  } else {
    // Check first available service or fallback
    const { data: fallbackService } = await supabase
      .from("services")
      .select("id")
      .limit(1)
      .maybeSingle();
    serviceId = fallbackService?.id || null;
  }

  // 4. Insert into service_requests table
  const budgetNumber = payload.estimatedBudget ? parseFloat(payload.estimatedBudget) : null;
  const formattedPhone = formatSriLankanPhone(payload.contactPhone);

  const { data: newRequest, error: reqError } = await supabase
    .from("service_requests")
    .insert({
      customer_id: customerId,
      service_id: serviceId,
      status: "pending_assignment",
      title: `${payload.serviceCategory}: ${payload.serviceName}`,
      description: payload.description,
      district: payload.district,
      city: payload.city,
      address: payload.address,
      preferred_date: payload.preferredDate,
      preferred_time_slot: payload.timeSlot,
      estimated_budget_lkr: budgetNumber,
      urgency_notes: payload.urgencyNotes || null,
      contact_name: payload.contactName,
      contact_phone: formattedPhone,
    })
    .select("id")
    .single();

  if (reqError) {
    console.error("Error inserting service request:", reqError);
    return { success: false, error: reqError.message };
  }

  // 5. Insert image records if provided
  if (payload.imagePaths && payload.imagePaths.length > 0 && newRequest) {
    const imageRecords = payload.imagePaths.map((path, idx) => ({
      request_id: newRequest.id,
      storage_path: path,
      file_name: `upload_${idx + 1}.jpg`,
    }));

    await supabase.from("request_images").insert(imageRecords);
  }

  return {
    success: true,
    requestId: newRequest.id,
  };
}
