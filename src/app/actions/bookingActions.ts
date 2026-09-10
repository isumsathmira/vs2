"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Customer confirms booking by accepting one of the submitted provider quotes
 */
export async function acceptQuoteAndConfirmBooking(quoteId: string) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please log in to confirm your booking." };
  }

  // 1. Fetch quote details
  const { data: quote, error: quoteErr } = await supabase
    .from("provider_quotes")
    .select(`
      *,
      request:service_requests (*)
    `)
    .eq("id", quoteId)
    .single();

  if (quoteErr || !quote) {
    return { success: false, error: "Quote not found or invalid." };
  }

  // Verify caller owns this request
  if (quote.request.customer_id !== user.id) {
    return { success: false, error: "Unauthorized: You do not own this service request." };
  }

  // 2. Mark this quote as accepted
  await supabase
    .from("provider_quotes")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", quoteId);

  // Mark all other quotes for this request as rejected
  await supabase
    .from("provider_quotes")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("request_id", quote.request_id)
    .neq("id", quoteId);

  // 3. Create the active booking
  const scheduledTime = new Date(`${quote.proposed_date}T10:00:00Z`).toISOString();

  const { data: booking, error: bookErr } = await supabase
    .from("bookings")
    .insert({
      request_id: quote.request_id,
      quote_id: quote.id,
      customer_id: user.id,
      provider_id: quote.provider_id,
      status: "confirmed",
      agreed_price_lkr: quote.quoted_price_lkr,
      payment_method: "direct_to_provider",
      payment_status: "pending_direct_payment",
      scheduled_for: scheduledTime,
    })
    .select("id")
    .single();

  if (bookErr) {
    console.error("Booking error:", bookErr);
    return { success: false, error: bookErr.message };
  }

  // 4. Update request status to 'booked'
  await supabase
    .from("service_requests")
    .update({ status: "booked", updated_at: new Date().toISOString() })
    .eq("id", quote.request_id);

  // 5. Initialize booking_status_history
  await supabase.from("booking_status_history").insert({
    booking_id: booking.id,
    status: "confirmed",
    notes: "Booking confirmed by customer. Pay Provider Directly upon job completion.",
    created_by: user.id,
  });

  // 6. Notify provider that their quote won
  await supabase.from("notifications").insert({
    user_id: quote.provider_id,
    title: "Booking Confirmed!",
    message: `A customer accepted your quote of Rs. ${quote.quoted_price_lkr.toLocaleString()}. Check your dashboard to begin the job.`,
    link_url: `/provider/dashboard`,
    is_read: false,
  });

  revalidatePath("/customer/dashboard");
  return { success: true, bookingId: booking.id };
}

/**
 * Customer rates provider after job completion
 */
export async function submitProviderReview(bookingId: string, rating: number, comment?: string) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.customer_id !== user.id) {
    return { success: false, error: "Invalid booking or unauthorized" };
  }

  if (booking.status !== "completed") {
    return { success: false, error: "Reviews can only be posted for completed jobs." };
  }

  const { error } = await supabase.from("reviews").insert({
    booking_id: bookingId,
    customer_id: user.id,
    provider_id: booking.provider_id,
    rating,
    comment: comment || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/customer/dashboard");
  return { success: true };
}
