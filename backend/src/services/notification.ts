import prisma from "../lib/prisma.js";

export async function createBookingNotification(
  userId: string,
  reference: string,
  siteName: string,
  guideName?: string | null,
  visitDate?: Date
) {
  const dateStr = visitDate ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(visitDate) : "";
  const guideText = guideName ? ` with guide ${guideName}` : "";

  return prisma.notification.create({
    data: {
      userId,
      type: "BOOKING",
      title: "Booking Confirmed",
      body: `Your visit to ${siteName}${guideText} on ${dateStr} is confirmed. Reference: ${reference}.`,
    },
  });
}

export async function createCancellationNotification(
  userId: string,
  reference: string,
  siteName: string
) {
  return prisma.notification.create({
    data: {
      userId,
      type: "BOOKING",
      title: "Booking Cancelled",
      body: `Your booking for ${siteName} (${reference}) has been successfully cancelled.`,
    },
  });
}

export async function notifyCrowdShift(
  siteId: string,
  level: "LOW" | "HIGH",
  percent: number
) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { name: true },
  });

  if (!site) return;

  const savedUsers = await prisma.savedSite.findMany({
    where: { siteId },
    select: { userId: true },
  });

  if (savedUsers.length === 0) return;

  const title =
    level === "HIGH"
      ? `Crowd Alert: ${site.name}`
      : `Good News: Low Crowds at ${site.name}`;

  const body =
    level === "HIGH"
      ? `${site.name} is experiencing heavy visitor density (${percent}% capacity). Check Smart Alternatives for quieter options.`
      : `${site.name} currently has peaceful conditions (${percent}% capacity). A great time to visit!`;

  await prisma.notification.createMany({
    data: savedUsers.map((u) => ({
      userId: u.userId,
      type: "CROWD_ALERT",
      title,
      body,
    })),
  });
}
