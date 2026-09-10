"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Admin action: Manually assign up to 3 providers to a pending service request
 */
export async function assignProvidersToRequest(requestId: string, providerIds: string[]) {
  const supabase = await createServerSupabaseClient();

  // 1. Verify admin role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Forbidden: Admin privileges required." };
  }

  // 2. Enforce MVP strict rule: Maximum 3 providers per request
  if (!providerIds || providerIds.length === 0 || providerIds.length > 3) {
    return { success: false, error: "You must select between 1 and 3 providers." };
  }

  try {
    // 3. Clear existing assignments if re-matching
    await supabase
      .from("request_assignments")
      .delete()
      .eq("request_id", requestId);

    // 4. Insert assignments into request_assignments table
    const assignments = providerIds.map((providerId) => ({
      request_id: requestId,
      provider_id: providerId,
      assigned_by_admin_id: user.id,
      assigned_at: new Date().toISOString(),
      notified_at: new Date().toISOString(),
    }));

    const { error: assignError } = await supabase
      .from("request_assignments")
      .insert(assignments);

    if (assignError) throw assignError;

    // 5. Update request status to 'assigned'
    const { error: updateError } = await supabase
      .from("service_requests")
      .update({ status: "assigned", updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (updateError) throw updateError;

    // 6. Create in-app notifications for each assigned provider
    const notifications = providerIds.map((providerId) => ({
      user_id: providerId,
      title: "New Job Match Assigned!",
      message: "An admin has selected you to quote on a new service request in your area.",
      link_url: `/provider/requests/${requestId}`,
      is_read: false,
    }));

    await supabase.from("notifications").insert(notifications);

    // 7. Audit log action
    await supabase.from("admin_actions").insert({
      admin_id: user.id,
      action_type: "MANUAL_MATCH_ASSIGNED",
      target_entity: "service_requests",
      target_id: requestId,
      metadata: { assigned_provider_ids: providerIds },
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/requests");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to assign providers:", err);
    return { success: false, error: err.message || "Failed to assign providers." };
  }
}

/**
 * Admin action: Approve or suspend a provider
 */
export async function updateProviderStatus(providerId: string, status: "approved" | "suspended" | "rejected") {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Forbidden: Admin privileges required." };
  }

  const { error } = await supabase
    .from("providers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", providerId);

  if (error) return { success: false, error: error.message };

  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: `PROVIDER_${status.toUpperCase()}`,
    target_entity: "providers",
    target_id: providerId,
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/providers");
  return { success: true };
}
