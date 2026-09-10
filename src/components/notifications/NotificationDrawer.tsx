"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { markNotificationAsRead } from "@/app/actions/safetyActions";
import { Bell, Check, ExternalLink, X } from "lucide-react";

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for real-time notifications
    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 text-xs transition-colors flex flex-col gap-1 ${
                    !n.is_read
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {n.title}
                    </span>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" />
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {n.message}
                  </p>
                  {n.link_url && (
                    <Link
                      href={n.link_url}
                      onClick={() => {
                        handleMarkRead(n.id);
                        setIsOpen(false);
                      }}
                      className="text-[11px] font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      View details <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
