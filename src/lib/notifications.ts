export type NotificationChannel = "in_app" | "sms" | "whatsapp";

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  linkUrl?: string;
  channels?: NotificationChannel[];
  recipientPhone?: string;
}

/**
 * Modular Notification Dispatcher
 * Currently stores in database (in_app), with prepared hooks for SMS (e.g. Dialog/Mobitel Sri Lanka gateways) or WhatsApp
 */
export async function dispatchNotification(
  supabase: any,
  payload: NotificationPayload
) {
  const channels = payload.channels || ["in_app"];

  // 1. In-App Notification (Database table)
  if (channels.includes("in_app")) {
    try {
      await supabase.from("notifications").insert({
        user_id: payload.userId,
        title: payload.title,
        message: payload.message,
        link_url: payload.linkUrl || null,
        is_read: false,
      });
    } catch (err) {
      console.error("Failed to insert in_app notification:", err);
    }
  }

  // 2. Prepared SMS Hook (Sri Lanka SMS gateway like Notify.lk or Twilio)
  if (channels.includes("sms") && payload.recipientPhone) {
    // Modular adapter: Can be wired with process.env.SL_SMS_API_KEY
    console.log(`[SMS Dispatch Simulation] To: ${payload.recipientPhone} - ${payload.message}`);
  }

  // 3. Prepared WhatsApp Hook
  if (channels.includes("whatsapp") && payload.recipientPhone) {
    console.log(`[WhatsApp Dispatch Simulation] To: ${payload.recipientPhone} - ${payload.message}`);
  }
}
