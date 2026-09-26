"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Keeps the dashboard in sync with the auth session:
 *  - the browser client refreshes the access token in the background before it expires
 *  - signing out in another tab (or the refresh token being revoked) bounces this tab to login
 *  - returning to a tab after a long idle re-validates the session
 */
export function AuthListener() {
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) {
        window.location.assign("/admin/login?signed_out=1");
      }
    });
    const onVisible = async () => {
      if (document.visibilityState !== "visible") return;
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) window.location.assign("/admin/login");
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return null;
}
