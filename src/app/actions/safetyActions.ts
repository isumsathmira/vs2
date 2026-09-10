"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateReportPayload {
  reportedUserId?: string;
  bookingId?: string;
  reason:
    | "Provider didn't arrive"
    | "Price dispute"
    | "Poor service"
    | "Inappropriate behavior"
    | "Fraud/scam"
    | "Other";
  description: string;
}

/**
 * Customer or provider submits a Trust & Safety report
 */
export async function submitTrustSafetyReport(payload: CreateReportPayload) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  if (!payload.reason || !payload.description.trim()) {
    return { success: false, error: "Please select a reason and provide description details." };
  }

  try {
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: payload.reportedUserId || null,
      booking_id: payload.bookingId || null,
      reason: payload.reason,
      description: payload.description.trim(),
      status: "open",
    });

    if (error) throw error;

    // Log admin alert
    await supabase.from("admin_actions").insert({
      admin_id: user.id, // logged reporter
      action_type: "SAFETY_REPORT_FILED",
      target_entity: "reports",
      target_id: payload.bookingId || user.id,
      metadata: { reason: payload.reason },
    });

    return { success: true };
  } catch (err: any) {
    console.error("Report submission failed:", err);
    return { success: false, error: err.message || "Failed to submit report." };
  }
}

/**
 * Marks notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false };

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  return { success: true };
}
