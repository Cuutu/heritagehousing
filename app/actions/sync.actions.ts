"use server";

import { auth } from "@clerk/nextjs/server";
import { syncAllIcalFeeds } from "@/lib/services/ical.service";
import { clerkConfigured } from "@/lib/clerk-config";

export async function syncIcalAdminAction() {
  if (clerkConfigured()) {
    const { userId } = await auth();
    if (!userId) {
      return { success: false as const, error: "No autorizado" };
    }
  }
  try {
    const result = await syncAllIcalFeeds();
    return {
      success: true as const,
      synced: result.synced,
      errors: result.errors,
      totalEventsFound: result.totalEventsFound,
      feedsProcessed: result.feedsProcessed,
      message: result.summaryMessage,
    };
  } catch (e) {
    console.error("syncIcalAdminAction", e);
    return { success: false as const, error: "Error al sincronizar" };
  }
}
