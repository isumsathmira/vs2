"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SubmitQuotePayload {
  requestId: string;
  quotedPriceLkr: number;
  estimatedDurationHours: number;
  proposedDate: string;
  proposedTimeSlot: string;
  providerNotes?: string;
}

/**
 * Provider submits a competitive quote on an assigned request
 */
export async function submitProviderQuote(payload: SubmitQuotePayload) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please log in as a service provider." };
  }

  // 1. Verify provider is assigned to this request
  const { data: assignment } = await supabase
    .from("request_assignments")
    .select("id")
    .eq("request_id", payload.requestId)
    .eq("provider_id", user.id)
    .maybeSingle();

  if (!assignment) {
    return {
      success: false,
      error: "You can only submit quotes for service requests that an Admin has assigned to you.",
    };
  }

  // 2. Insert or update the provider's quote
  const { data: quote, error: quoteError } = await supabase
    .from("provider_quotes")
    .upsert({
      request_id: payload.requestId,
      provider_id: user.id,
      quoted_price_lkr: payload.quotedPriceLkr,
      estimated_duration_hours: payload.estimatedDurationHours,
      proposed_date: payload.proposedDate,
      proposed_time_slot: payload.proposedTimeSlot,
      provider_notes: payload.providerNotes || null,
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (quoteError) {
    return { success: false, error: quoteError.message };
  }

  // 3. Update request status to 'quotes_received'
  await supabase
    .from("service_requests")
    .update({ status: "quotes_received", updated_at: new Date().toISOString() })
    .eq("id", payload.requestId);

  // 4. Notify customer that a new quote has arrived
  const { data: request } = await supabase
    .from("service_requests")
    .select("customer_id, title")
    .eq("id", payload.requestId)
    .single();

  if (request) {
    await supabase.from("notifications").insert({
      user_id: request.customer_id,
      title: "New Quote Received!",
      message: `A provider has submitted a quote for "${request.title}". Check your dashboard to compare quotes.`,
      link_url: `/customer/requests/${payload.requestId}`,
      is_read: false,
    });
  }

  revalidatePath(`/provider/requests/${payload.requestId}`);
  revalidatePath("/provider/dashboard");
  return { success: true, quoteId: quote.id };
}

/**
 * Provider advances the booking status sequentially:
 * Confirmed -> On the way -> Arrived -> Working -> Completed
 */
export async function updateBookingJobStatus(
  bookingId: string,
  newStatus: "on_the_way" | "arrived" | "working" | "completed" | "cancelled",
  statusNotes?: string
) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Fetch current booking
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (!booking) return { success: false, error: "Booking not found" };

  // Ensure caller is provider or customer
  if (booking.provider_id !== user.id && booking.customer_id !== user.id) {
    return { success: false, error: "Not authorized to update this booking" };
  }

  // 1. Update booking
  const updatePayload: any = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  // If completed, record direct payment state if confirmed
  if (newStatus === "completed") {
    updatePayload.payment_status = "paid_directly";
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update(updatePayload)
    .eq("id", bookingId);

  if (updateError) return { success: false, error: updateError.message };

  // 2. Append to booking_status_history audit timeline
  await supabase.from("booking_status_history").insert({
    booking_id: bookingId,
    status: newStatus,
    notes: statusNotes || null,
    created_by: user.id,
  });

  // 3. Notify the other party
  const notifyRecipient = user.id === booking.provider_id ? booking.customer_id : booking.provider_id;
  await supabase.from("notifications").insert({
    user_id: notifyRecipient,
    title: `Job Status: ${newStatus.replace("_", " ").toUpperCase()}`,
    message: `Your booking status has been updated to "${newStatus.replace("_", " ")}".`,
    link_url: `/customer/dashboard`,
    is_read: false,
  });

  revalidatePath(`/provider/bookings/${bookingId}`);
  revalidatePath(`/customer/dashboard`);
  return { success: true };
}
