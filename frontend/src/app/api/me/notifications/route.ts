import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export interface StoredNotification {
  id: string;
  userId: string;
  type: "BOOKING" | "CROWD_ALERT" | "GUIDE_VERIFICATION";
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  siteSlug?: string;
}

const DEFAULT_WELCOME_NOTIFICATIONS: StoredNotification[] = [
  {
    id: "notif_welcome_1",
    userId: "user_explorer",
    type: "GUIDE_VERIFICATION",
    title: "ASI Guide Network Verified",
    body: "Over 1,860 certified Archaeological Survey of India guides are active and verified across 46 monuments.",
    readAt: null,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "notif_welcome_2",
    userId: "user_explorer",
    type: "CROWD_ALERT",
    title: "Crowd Intelligence Active",
    body: "Real-time AI telemetry is monitoring live queue densities at Taj Mahal, Amber Fort, and Red Fort.",
    readAt: null,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export async function GET() {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get("heritage_notifications")?.value;
    let notifications: StoredNotification[] = [];

    if (raw) {
      try {
        notifications = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
      } catch {
        notifications = [];
      }
    }

    if (!Array.isArray(notifications) || notifications.length === 0) {
      notifications = DEFAULT_WELCOME_NOTIFICATIONS;
    }

    return NextResponse.json({
      data: notifications,
      error: null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error reading notifications";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, markAll } = body;
    const cookieStore = cookies();
    const raw = cookieStore.get("heritage_notifications")?.value;
    let notifications: StoredNotification[] = [];

    if (raw) {
      try {
        notifications = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
      } catch {
        notifications = [];
      }
    }

    if (notifications.length === 0) {
      notifications = [...DEFAULT_WELCOME_NOTIFICATIONS];
    }

    const now = new Date().toISOString();
    if (markAll) {
      notifications = notifications.map((n) => ({ ...n, readAt: now }));
    } else if (id) {
      notifications = notifications.map((n) => (n.id === id ? { ...n, readAt: now } : n));
    }

    cookieStore.set(
      "heritage_notifications",
      Buffer.from(JSON.stringify(notifications.slice(0, 30))).toString("base64"),
      {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      }
    );

    return NextResponse.json({
      data: { success: true, notifications },
      error: null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating notification";
    return NextResponse.json(
      { data: null, error: { message, code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
